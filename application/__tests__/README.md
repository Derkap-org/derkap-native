# Tests Derkap

Ce dossier contient la suite de tests pour l'application Derkap, comprenant des tests unitaires, d'intégration et E2E.

## Structure des Tests

```
__tests__/
├── setup.ts                    # Configuration globale des tests
├── functions/                  # Tests unitaires des fonctions métier
│   ├── encryption-action.test.ts
│   └── friends-action.test.ts
├── store/                      # Tests des stores Zustand
│   └── useFriendStore.test.ts
├── e2e/                        # Tests End-to-End
│   └── user-workflow.test.ts
└── README.md                   # Cette documentation
```

## Types de Tests

### 1. Tests Unitaires

**Objectif :** Tester les fonctions métier isolément.

**Couverture :**
- ✅ Fonctions de chiffrement/déchiffrement (`encryption-action.test.ts`)
- ✅ Gestion des amis (`friends-action.test.ts`)
- ✅ Stores Zustand (`useFriendStore.test.ts`)

**Technologies :**
- Jest
- React Native Testing Library
- Mocks Supabase

### 2. Tests d'Intégration

**Objectif :** Tester l'API et les interactions avec la base de données.

**Localisation :** `api/__tests__/api.test.js`

**Couverture :**
- ✅ Endpoints `/api/generate-key`
- ✅ Endpoints `/api/get-key`
- ✅ Authentification JWT
- ✅ Gestion des erreurs
- ✅ Tests de performance

### 3. Tests E2E

**Objectif :** Tester les workflows complets utilisateur.

**Couverture :**
- ✅ Parcours complet : Auth → Amis → Défi → Réponse
- ✅ Gestion d'erreurs dans les workflows
- ✅ Tests de performance concurrents

## Installation et Configuration

### Prérequis

```bash
# Application
cd application
pnpm install
# ou npm install

# API
cd ../api
npm install
```

### Variables d'Environnement

Créer un fichier `.env.test` dans le dossier `application/` :

```env
# Base de données de test
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_JWT_SECRET=your-test-jwt-secret

# API de test
TEST_API_URL=http://localhost:3000
```

## Exécution des Tests

### Tests Application (React Native)

```bash
cd application

# Exécuter tous les tests
pnpm test

# Mode watch (développement)
pnpm test:watch

# Avec couverture
pnpm test:coverage

# Tests spécifiques
pnpm test encryption-action
pnpm test friends-action
pnpm test useFriendStore
```

### Tests API (Node.js)

```bash
cd api

# Exécuter les tests d'intégration
npm test

# Mode watch
npm run test:watch

# Avec couverture
npm run test:coverage
```

### Tests E2E

```bash
cd application

# Tests E2E avec environnement simulé
pnpm test e2e/user-workflow.test.ts

# Pour des tests E2E réels avec Detox (à configurer)
# npx detox test
```

## Seuils de Couverture

**Application :**
- Branches : 70%
- Fonctions : 70%
- Lignes : 70%
- Statements : 70%

**API :**
- Branches : 70%
- Fonctions : 70%
- Lignes : 70%
- Statements : 70%

## Configuration CI/CD

### GitHub Actions

Ajouter dans `.github/workflows/tests.yml` :

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test-app:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./application
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3

  test-api:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./api
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test:coverage
```

## Stratégie de Tests

### Priorités

1. **Critique :** Chiffrement/déchiffrement photos
2. **Haute :** Authentification et gestion des amis
3. **Moyenne :** Interface utilisateur et stores
4. **Basse :** Fonctionnalités cosmétiques

### Cas de Tests Essentiels

**Sécurité :**
- ✅ Chiffrement correct des photos
- ✅ Clés uniques par défi
- ✅ Authentification JWT valide
- ✅ Autorisation d'accès aux défis

**Fonctionnel :**
- ✅ Workflow complet utilisateur
- ✅ Gestion des erreurs réseau
- ✅ États de chargement corrects
- ✅ Synchronisation des données

**Performance :**
- ✅ Temps de réponse API < 5s
- ✅ Gestion requêtes concurrentes
- ✅ Optimisation des images

## Mocks et Fixtures

### Supabase Mock

```typescript
// __tests__/setup.ts
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: { /* auth mocks */ },
    from: jest.fn(() => ({ /* query mocks */ })),
    storage: { /* storage mocks */ }
  }))
}));
```

### Données de Test

```typescript
// Utilisateur de test
const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  user_metadata: {
    username: 'testuser',
    avatar_url: null
  }
};

// Défi de test
const mockChallenge = {
  id: 123,
  author_id: 'test-user-123',
  challenge: 'Test challenge',
  photo_url: 'encrypted-photo.jpg',
  created_at: '2024-01-01'
};
```

## Debugging

### Tests qui échouent

```bash
# Mode verbose
pnpm test -- --verbose

# Tests spécifiques avec debug
pnpm test -- --testNamePattern="should encrypt photo"

# Logs détaillés
DEBUG=* pnpm test
```

### Performance

```bash
# Profiling des tests
pnpm test -- --maxWorkers=1 --detectOpenHandles

# Temps d'exécution
pnpm test -- --verbose --passWithNoTests
```

## Maintenance

### Mise à jour des Tests

1. **Nouvelles fonctionnalités :** Ajouter tests unitaires + E2E
2. **Corrections de bugs :** Ajouter test de régression
3. **Refactoring :** Maintenir la couverture existante

### Nettoyage

```bash
# Supprimer les snapshots obsolètes
pnpm test -- --updateSnapshot

# Cache Jest
npx jest --clearCache
```

## Roadmap

### À venir

- [ ] Tests Detox réels pour mobile
- [ ] Tests de charge avec Artillery
- [ ] Tests d'accessibilité
- [ ] Tests de sécurité automatisés
- [ ] Tests de performance UI

### Intégrations Futures

- [ ] SonarQube pour qualité du code
- [ ] Codecov pour couverture
- [ ] Percy pour tests visuels
- [ ] Lighthouse CI pour performance

---

**Note :** Cette suite de tests évolue avec le projet. Consulter le dossier technique complet pour la stratégie détaillée.