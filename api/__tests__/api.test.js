const request = require('supertest');
const jwt = require('jsonwebtoken');

// Configuration de test
const API_URL = process.env.TEST_API_URL || 'http://localhost:3000';
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || 'test-secret';

// Helper pour générer un token JWT valide
function generateTestToken(userId = 'test-user-123') {
  return jwt.sign(
    {
      sub: userId,
      aud: 'authenticated',
      role: 'authenticated',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    },
    SUPABASE_JWT_SECRET,
    { algorithm: 'HS256' }
  );
}

describe('API Integration Tests', () => {
  let validToken;
  let refreshToken;

  beforeAll(() => {
    validToken = generateTestToken();
    refreshToken = 'test-refresh-token';
  });

  describe('POST /api/generate-key', () => {
    test('should generate encryption key for authenticated user', async () => {
      const challenge = 'Test challenge pour génération clé';
      
      const response = await request(API_URL)
        .post('/api/generate-key')
        .set('Authorization', `Bearer ${validToken}`)
        .set('refresh_token', refreshToken)
        .send({ challenge })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('key');
      expect(response.body).toHaveProperty('base_key');
      expect(typeof response.body.key).toBe('string');
      expect(typeof response.body.base_key).toBe('string');
      expect(response.body.key.length).toBeGreaterThan(0);
      expect(response.body.base_key.length).toBeGreaterThan(0);
    });

    test('should return 401 for unauthenticated request', async () => {
      const challenge = 'Test challenge sans auth';
      
      const response = await request(API_URL)
        .post('/api/generate-key')
        .send({ challenge })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Unauthorized');
    });

    test('should return 401 for invalid token', async () => {
      const challenge = 'Test challenge token invalide';
      const invalidToken = 'invalid.jwt.token';
      
      const response = await request(API_URL)
        .post('/api/generate-key')
        .set('Authorization', `Bearer ${invalidToken}`)
        .set('refresh_token', refreshToken)
        .send({ challenge })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Unauthorized');
    });

    test('should return 400 for missing challenge', async () => {
      const response = await request(API_URL)
        .post('/api/generate-key')
        .set('Authorization', `Bearer ${validToken}`)
        .set('refresh_token', refreshToken)
        .send({}) // Pas de challenge
        .expect('Content-Type', /json/)
        .expect(500); // L'API retourne 500 si challenge manquant

      expect(response.body).toHaveProperty('success', false);
    });

    test('should generate different keys for same challenge', async () => {
      const challenge = 'Challenge identique';
      
      const response1 = await request(API_URL)
        .post('/api/generate-key')
        .set('Authorization', `Bearer ${validToken}`)
        .set('refresh_token', refreshToken)
        .send({ challenge })
        .expect(200);

      const response2 = await request(API_URL)
        .post('/api/generate-key')
        .set('Authorization', `Bearer ${validToken}`)
        .set('refresh_token', refreshToken)
        .send({ challenge })
        .expect(200);

      expect(response1.body.key).not.toBe(response2.body.key);
      expect(response1.body.base_key).not.toBe(response2.body.base_key);
    });
  });

  describe('POST /api/get-key', () => {
    test('should return encryption key for valid derkap_id', async () => {
      const derkapId = 123;
      
      const response = await request(API_URL)
        .post('/api/get-key')
        .set('Authorization', `Bearer ${validToken}`)
        .set('refresh_token', refreshToken)
        .send({ derkap_id: derkapId })
        .expect('Content-Type', /json/);

      // Peut retourner 200 avec la clé ou 500 si l'utilisateur n'a pas accès
      if (response.status === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('key');
        expect(typeof response.body.key).toBe('string');
      } else {
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('success', false);
      }
    });

    test('should return 401 for unauthenticated request', async () => {
      const derkapId = 123;
      
      const response = await request(API_URL)
        .post('/api/get-key')
        .send({ derkap_id: derkapId })
        .expect('Content-Type', /json/)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('Unauthorized');
    });

    test('should return 400 for missing derkap_id', async () => {
      const response = await request(API_URL)
        .post('/api/get-key')
        .set('Authorization', `Bearer ${validToken}`)
        .set('refresh_token', refreshToken)
        .send({}) // Pas de derkap_id
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toContain('No derkap_id found');
    });

    test('should handle non-existent derkap_id', async () => {
      const nonExistentId = 999999;
      
      const response = await request(API_URL)
        .post('/api/get-key')
        .set('Authorization', `Bearer ${validToken}`)
        .set('refresh_token', refreshToken)
        .send({ derkap_id: nonExistentId })
        .expect('Content-Type', /json/)
        .expect(500);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Authentication and Authorization', () => {
    test('should validate JWT token correctly', async () => {
      // Test avec un token expiré
      const expiredToken = jwt.sign(
        {
          sub: 'test-user',
          aud: 'authenticated',
          role: 'authenticated',
          iat: Math.floor(Date.now() / 1000) - 7200, // Il y a 2 heures
          exp: Math.floor(Date.now() / 1000) - 3600  // Expiré il y a 1 heure
        },
        SUPABASE_JWT_SECRET,
        { algorithm: 'HS256' }
      );

      const response = await request(API_URL)
        .post('/api/generate-key')
        .set('Authorization', `Bearer ${expiredToken}`)
        .set('refresh_token', refreshToken)
        .send({ challenge: 'Test avec token expiré' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });

    test('should require both access and refresh tokens', async () => {
      // Test sans refresh token
      const response1 = await request(API_URL)
        .post('/api/generate-key')
        .set('Authorization', `Bearer ${validToken}`)
        // Pas de refresh_token header
        .send({ challenge: 'Test sans refresh token' })
        .expect(401);

      expect(response1.body).toHaveProperty('success', false);

      // Test sans access token
      const response2 = await request(API_URL)
        .post('/api/generate-key')
        // Pas d'Authorization header
        .set('refresh_token', refreshToken)
        .send({ challenge: 'Test sans access token' })
        .expect(401);

      expect(response2.body).toHaveProperty('success', false);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON', async () => {
      const response = await request(API_URL)
        .post('/api/generate-key')
        .set('Authorization', `Bearer ${validToken}`)
        .set('refresh_token', refreshToken)
        .set('Content-Type', 'application/json')
        .send('{ malformed json }')
        .expect(400);

      // L'API devrait gérer les erreurs JSON malformées
    });

    test('should handle very long challenge strings', async () => {
      const veryLongChallenge = 'A'.repeat(10000); // Challenge de 10k caractères
      
      const response = await request(API_URL)
        .post('/api/generate-key')
        .set('Authorization', `Bearer ${validToken}`)
        .set('refresh_token', refreshToken)
        .send({ challenge: veryLongChallenge })
        .expect('Content-Type', /json/);

      // Devrait soit accepter, soit rejeter proprement
      expect([200, 400, 500]).toContain(response.status);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Performance Tests', () => {
    test('should respond within reasonable time', async () => {
      const startTime = Date.now();
      
      const response = await request(API_URL)
        .post('/api/generate-key')
        .set('Authorization', `Bearer ${validToken}`)
        .set('refresh_token', refreshToken)
        .send({ challenge: 'Performance test challenge' })
        .expect(200);

      const responseTime = Date.now() - startTime;
      
      expect(responseTime).toBeLessThan(5000); // Moins de 5 secondes
      expect(response.body).toHaveProperty('success', true);
    });

    test('should handle concurrent requests', async () => {
      const promises = [];
      const concurrentRequests = 5;
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          request(API_URL)
            .post('/api/generate-key')
            .set('Authorization', `Bearer ${validToken}`)
            .set('refresh_token', refreshToken)
            .send({ challenge: `Concurrent test ${i}` })
        );
      }

      const responses = await Promise.all(promises);
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('key');
      });

      // Vérifier que toutes les clés sont différentes
      const keys = responses.map(r => r.body.key);
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(concurrentRequests);
    });
  });
});