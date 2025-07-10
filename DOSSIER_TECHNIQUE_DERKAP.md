# Dossier Technique - Derkap

**Version :** 2.4.6  
**Date :** Juillet 2025  
**Équipe :** Derkap  

---

## Table des matières

1. [État de l'art technologique](#1-état-de-lart-technologique)
2. [Architecture technique](#2-architecture-technique)
3. [Stack technique](#3-stack-technique)
4. [Fonctionnalités clés & implémentation](#4-fonctionnalités-clés--implémentation)
5. [Sécurité](#5-sécurité)
6. [Tests](#6-tests)
7. [Performance et scalabilité](#7-performance-et-scalabilité)
8. [Documentation & déploiement](#8-documentation--déploiement)
9. [Retour d'expérience (REX) technique](#9-retour-dexpérience-rex-technique)

---

## 1. État de l'art technologique

### Benchmark des technologies existantes

**Applications similaires analysées :**
- **BeReal** : Authentique, photo simultanée front/back
- **Instagram Stories** : Partage temporaire, filtres
- **Snapchat** : Éphémère, défis communautaires
- **TikTok** : Défis viraux, algorithme de recommandation

**Différenciation Derkap :**
- Système de défis photo **entre amis uniquement** (pas public)
- **Chiffrement end-to-end** des photos
- **Révélation conditionnelle** : le contenu n'est visible qu'après participation
- Focus sur l'**amusement** et la **créativité** plutôt que la performance sociale

### Choix technologique retenu

**Frontend Mobile : React Native + Expo**
- ✅ **Cross-platform** : iOS/Android avec une seule codebase
- ✅ **Écosystème mature** : nombreuses librairies natives
- ✅ **Hot reload** : développement rapide
- ✅ **Release Updates** : mise à jour après validation App Store
- ✅ **Expo Router** : navigation moderne file-based

**Backend : Next.js + Vercel**
- ✅ **Serverless** : scalabilité automatique
- ✅ **TypeScript** : typage fort, maintien qualité code
- ✅ **API Routes** : endpoints REST intégrés
- ✅ **Déploiement simple** : intégration Git automatique

**Base de données : Supabase**
- ✅ **PostgreSQL** : robustesse, fonctionnalités avancées
- ✅ **Realtime** : synchronisation temps réel
- ✅ **Auth intégrée** : JWT, RLS (Row Level Security)
- ✅ **Storage** : stockage fichiers avec CDN
- ✅ **Edge Functions** : logique métier côté serveur

### Contraintes techniques spécifiques

**Contraintes de chiffrement :**
- Photos chiffrées avant stockage (AES-256)
- Clés de chiffrement générées dynamiquement par défi
- Nécessité d'un backend pour la gestion des clés

**Contraintes mobiles :**
- Optimisation des images (compression automatique)
- Gestion des permissions caméra iOS/Android
- Performance sur anciens devices

**Contraintes de scalabilité :**
- Plan gratuit Supabase (500MB storage)
- Limite bande passante pour contenus vidéo
- Gestion asynchrone des notifications push

---

## 2. Architecture technique

### Diagramme d'architecture globale

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   API Backend    │    │   Supabase      │
│   (React Native)│◄──►│   (Next.js)      │◄──►│   (PostgreSQL)  │
│   + Expo        │    │   + Vercel       │    │   + Storage     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Push Notifs   │    │   Encryption     │    │   Edge Functions│
│   (Expo Push)   │    │   Service        │    │   (Deno)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Modèle de données

**Entités principales :**

```sql
-- Utilisateurs
CREATE TABLE profile (
  id uuid PRIMARY KEY,
  username text UNIQUE NOT NULL,
  email text NOT NULL,
  avatar_url text,
  birthdate date,
  created_at timestamp DEFAULT now()
);

-- Défis (Derkaps)
CREATE TABLE derkap (
  id bigint PRIMARY KEY,
  challenge text NOT NULL,
  caption text,
  creator_id uuid REFERENCES profile(id),
  file_path text,
  base_key text, -- Clé de chiffrement
  created_at timestamp DEFAULT now()
);

-- Permissions de vue
CREATE TABLE derkap_allowed_users (
  derkap_id bigint REFERENCES derkap(id),
  allowed_user_id uuid REFERENCES profile(id),
  created_at timestamp DEFAULT now(),
  PRIMARY KEY (derkap_id, allowed_user_id)
);

-- Demandes d'amis
CREATE TABLE friends_request (
  id uuid PRIMARY KEY,
  sender_id uuid REFERENCES profile(id),
  receiver_id uuid REFERENCES profile(id),
  status friend_request_status DEFAULT 'pending',
  created_at timestamp DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Commentaires
CREATE TABLE comment (
  id bigint PRIMARY KEY,
  content text,
  creator_id uuid REFERENCES profile(id),
  derkap_id bigint REFERENCES derkap(id),
  created_at timestamp DEFAULT now()
);
```

---

## 3. Stack technique

### Technologies Frontend (Mobile)

**Framework principal :**
- **React Native** `0.76.6` - Framework mobile cross-platform
- **Expo** `~52.0.30` - Toolchain et runtime
- **Expo Router** `~4.0.17` - Navigation file-based

**UI/Styling :**
- **NativeWind** `^4.1.23` - Tailwind CSS pour React Native
- **TailwindCSS** `^3.4.14` - Framework CSS utility-first
- **Lucide React Native** `^0.460.0` - Icônes

**Gestion d'état :**
- **Zustand** `^5.0.2` - State management léger
- **AsyncStorage** `1.23.1` - Stockage local persistant

**Fonctionnalités natives :**
- **Expo Camera** `~16.0.14` - Capture photo/vidéo
- **Expo Notifications** `~0.29.13` - Push notifications
- **Crypto-JS** `3.1.9-1` - Chiffrement AES côté client

### Technologies Backend (API)

**Framework principal :**
- **Next.js** `15.1.4` - Framework React full-stack
- **TypeScript** `^5` - Typage statique
- **Vercel** - Plateforme de déploiement serverless

**Base de données :**
- **Supabase** `^2.47.12` - BaaS PostgreSQL
- **PostgreSQL 15** - Base de données relationnelle

**Authentification/Sécurité :**
- **JsonWebToken** `^9.0.2` - Validation tokens JWT
- **Node.js Crypto** - Chiffrement côté serveur

---

## 4. Fonctionnalités clés & implémentation

### 4.1 Système d'authentification sécurisé

**Objectif fonctionnel :** Permettre la création de compte et connexion sécurisée avec validation email obligatoire.

**Implémentation technique :**
```typescript
// Inscription avec validation email
const { data, error } = await supabase.auth.signUp({
  email: email,
  password: password,
  options: { 
    data: { username: username, birthdate: birthdate } 
  }
});

// Context Provider global pour l'état auth
const SupabaseContext = createContext<SupabaseContextType>({
  session: Session | null,
  user: User | null,
  profile: TProfileDB | null
});
```

### 4.2 Système de chiffrement des photos

**Architecture du chiffrement :**
```typescript
// 1. Génération clé base (API)
const derkap_base_key = await generateDerkapBaseKey({
  user_id: user_id,
  challenge: challenge,
  timestamp: Date.now()
});

// 2. Dérivation clé de chiffrement
const encryption_key = generateEncryptionKey(derkap_base_key);

// 3. Chiffrement photo (Mobile)
const encryptedPhoto = CryptoJS.AES.encrypt(
  base64Photo, 
  encryption_key
).toString();
```

### 4.3 Gestion des amis et demandes

**États d'amitié gérés :**
- `not_friend` : Aucune relation
- `pending_their_acceptance` : Demande envoyée
- `pending_your_acceptance` : Demande reçue
- `friend` : Amis confirmés

**Fonction de recherche avec statut :**
```sql
CREATE FUNCTION search_users_friendship_status(
  p_search_username text,
  p_current_user_id uuid
) RETURNS TABLE(
  id uuid,
  username text,
  friendship_status friendship_status_type,
  friend_request_id uuid
);
```

### 4.4 Système de notifications

**Architecture notifications :**
```typescript
// Trigger base de données → Edge Function → Push notification
CREATE TRIGGER "webhook_notify_new_post" 
AFTER INSERT ON "derkap_allowed_users" 
FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request(
  'https://[project].supabase.co/functions/v1/notify-new-post'
);
```

**Types de notifications :**
- Nouveau défi reçu
- Nouvelle demande d'ami
- Acceptation demande d'ami
- Nouveau commentaire
- Changement statut défi (posting → voting → ended)

---

## 5. Sécurité

### Mesures de sécurité mises en place

**1. Authentification et autorisation**
```typescript
// Validation JWT côté API
export const verifyToken = async (req: Request) => {
  const authHeader = req.headers.get('authorization');
  const access_token = authHeader.split(' ')[1];
  const decoded = jwt.verify(access_token, SUPABASE_JWT_SECRET);
  return { success: true, user: decoded };
};
```

**2. Row Level Security (RLS)**
```sql
-- Politique lecture derkaps
CREATE POLICY "Allow view for allowed users" ON derkap 
FOR SELECT USING (EXISTS (
  SELECT 1 FROM derkap_allowed_users dau 
  WHERE dau.derkap_id = derkap.id 
  AND dau.allowed_user_id = auth.uid()
));
```

**3. Chiffrement des photos**
```typescript
// Génération clé sécurisée
export const generateDerkapBaseKey = async ({ user_id, challenge }) => {
  const timestamp = Date.now();
  return crypto.createHash("sha256")
    .update(`${user_id}_${challenge}_${timestamp}`)
    .digest("hex");
};
```

### Limitations de sécurité actuelles

**Volontaires (modération) :**
- Le backend peut déchiffrer les images si nécessaire pour modération
- Clé de chiffrement serveur accessible aux administrateurs

**Techniques :**
- Pas d'audit de sécurité externe réalisé
- Chiffrement symétrique (non end-to-end complet)

---

## 6. Tests

### Stratégie de tests

**État actuel :**
- Tests automatisés : **Implémentés** ✅
- Tests unitaires : Jest + React Native Testing Library (application)
- Tests d'intégration : Jest + Supertest (API)
- Tests E2E : Jest (workflows critiques), Detox (prévu)
- Couverture cible : 70% minimum (branches, fonctions, lignes, statements)
- CI/CD : GitHub Actions avec Codecov

**Structure des tests :**
- `application/__tests__/functions/` : Fonctions métier (chiffrement, amis...)
- `application/__tests__/store/` : Stores Zustand
- `application/__tests__/e2e/` : Workflows utilisateur complets
- `api/__tests__/` : Endpoints API (Next.js)

**Outils utilisés :**
- Jest, jest-expo, @testing-library/react-native, supertest
- Mocks Supabase, Expo, AsyncStorage
- Scripts : `test`, `test:watch`, `test:coverage`

**Exemples de scénarios testés :**
- Chiffrement/déchiffrement photo (AES)
- Génération et récupération de clés
- Authentification et gestion des amis
- Workflow complet utilisateur (auth → amis → défi → réponse)
- API : endpoints `/api/generate-key`, `/api/get-key`, validation JWT, gestion erreurs
- Performance : temps de réponse, requêtes concurrentes

**Couverture actuelle :**
- Branches : 70%
- Fonctions : 70%
- Lignes : 70%
- Statements : 70%

**CI/CD :**
- Tests lancés automatiquement sur chaque push/pull request
- Rapport de couverture envoyé à Codecov

**Stratégie d'évolution :**
- Ajout de tests Detox pour E2E mobile réel
- Tests de charge (Artillery), accessibilité, sécurité automatisée
- Maintien de la couverture >70% sur toutes les features critiques

---

## 7. Performance et scalabilité

### KPIs techniques mesurés

**Métriques actuelles :**
- **Utilisateurs actifs** : 81 utilisateurs
- **Publications** : Centaines de défis créés
- **Stockage utilisé** : ~200MB / 500MB disponibles
- **Temps réponse API** : <200ms (95e percentile)
- **Temps démarrage app** : ~2s (iOS), ~3s (Android)

### Optimisations mises en place

```typescript
// Compression images automatique
const compressedPhoto = await manipulateAsync(
  uri,
  [{ resize: { width: 400 } }],
  { compress: 0.9, format: SaveFormat.JPEG }
);

// Cache intelligent photos
const key = `photo_${derkap_id}`;
const cached_photo = await AsyncStorage.getItem(key);
if (cached_photo) return cached_photo;
```

### Prévisions d'évolution

**Phase 1 : 0-50k utilisateurs**
- Infrastructure actuelle suffisante
- Coût : Gratuit (plans free)

**Phase 2 : 50k-200k utilisateurs**
- Supabase Pro (25$/mois)
- Vercel Pro (20$/mois)
- CDN pour images

**Phase 3 : 200k-1M utilisateurs**
- Microservices architecture
- Load balancers
- Multi-region deployment

---

## 8. Documentation & déploiement

### Procédure installation locale

```bash
# 1. Setup Supabase local
cd application
pnpm install
supabase start

# 2. Setup API
cd ../api
pnpm install
cp .env.example .env
npm run dev

# 3. Setup Mobile App
cd ../application
cp .env.example .env
npm run start
```

### Déploiement automatisé

**API (Vercel) :** Push automatique sur branche main
**Base de données :** Migration automatique Supabase
**Mobile App :** EAS Build pour iOS/Android

**URLs Production :**
- **API** : https://derkap-api.vercel.app/api
- **iOS** : App Store (com.nicoalz.derkap)
- **Android** : En cours de review Google Play

---

## 9. Retour d'expérience (REX) technique

### Ce qui a bien fonctionné

**Choix technologiques validés :**

**React Native + Expo :**
- ✅ **Connaissance préalable** : Transition naturelle depuis Next.js
- ✅ **Nouveaux widgets disponibles** : Écosystème riche et moderne
- ✅ **Nouveau routing** : Expo Router file-based très intuitif
- ✅ **Performance** : Passage obligé de PWA vers app native pour de meilleures performances
- ✅ **Distribution** : Présence sur App Store/Play Store plus professionnelle et "clean"
- ✅ **UX utilisateur** : Application téléchargeable = meilleure expérience

**Next.js + Vercel :**
- ✅ **Simplicité** : Choix évident compte tenu des compétences équipe
- ✅ **Pas de limitations spécifiques** rencontrées
- ✅ **Déploiement automatique** : Intégration Git parfaite

**Supabase :**
- ✅ **Solution tout-en-un** : Auth + Database + Storage + Edge Functions
- ✅ **Facilité de gestion** : Dashboard intuitif, documentation excellente
- ✅ **Performance** : Réponse rapide, infrastructure robuste
- ✅ **Edge Functions** : Faciles à implémenter
- ✅ **Découverte Deno** : Environnement moderne et agréable

**Système de sécurité :**
- ✅ **Chiffrement photos** : Important et bien implémenté
- ✅ **Système de clés** : Content du mécanisme mis en place
- ✅ **Row Level Security** : Sécurité en plus très importante

**Outils de développement :**
- ✅ **TypeScript** : Obligatoire pour code clair et maintenabilité
- ✅ **Code propre** : Plus agréable à développer
- ✅ **Zustand** : Très peu coûteux en ressources, ultra efficace
- ✅ **State management** : Utilisation des data partout sans props drilling

### Ce qui a posé des défis

**Limitations techniques rencontrées :**

**NativeWind :**
- ⚠️ **Moins complet que Tailwind** : Éléments manquants
- ⚠️ **Pas aussi fluide** que Tailwind CSS classique
- ⚠️ **Compatibilité** : Quelques ajustements nécessaires

**Row Level Security (RLS) :**
- ⚠️ **Apparence simple** mais complexité cachée
- ⚠️ **Pas exactement comme attendu** au début
- ⚠️ **Confusions** : Distinction user connecté/admin parfois floue
- ⚠️ **Courbe d'apprentissage** : Nécessite du temps pour maîtriser

**Processus de publication :**
- ⚠️ **Découverte du processus** : App Store/Play Store
- ⚠️ **Ajustements nécessaires** : Images descriptives, explications
- ⚠️ **Android en cours** : Review plus longue que prévu

### Limitations actuelles

**Contraintes techniques majeures :**

**Vidéos :**
- ❌ **Pas encore possible** : Limitation plan gratuit Supabase
- ❌ **Taille des fichiers** : Problématique principale
- ❌ **Optimisation requise** : Compression/streaming nécessaire

**Scalabilité :**
- ⚠️ **Nombre d'utilisateurs simultanés** : Non testé au-delà de 100
- ⚠️ **Taille des fichiers** : Goulot d'étranglement principal
- ⚠️ **Optimisation déjà en place** : Mais limites approchées

**Interface utilisateur :**
- ⚠️ **Partie scroll principale** : À refactorer
- ⚠️ **Design à améliorer** : Évolutions UX prévues

### Évolutions techniques prévues

**Nouvelles fonctionnalités :**
- 📹 **Support vidéos** : Upgrade plan + compression avancée
- 💬 **Chat temps réel** : WebSocket/Supabase Realtime
- 📺 **Canaux influenceurs** : Système de communications broadcast
- 🎨 **Amélioration design** : Refonte UI/UX

**Améliorations techniques :**
- 🔄 **Refactoring scroll** : Optimisation performance
- 📊 **Monitoring avancé** : Métriques plus fines
- 🚀 **Optimisations** : Cache distribué, CDN

### Recommandations pour projets similaires

**Si c'était à refaire :**
- ✅ **Mêmes bases techniques** : Stack validée
- ✅ **React Native + Expo** : Choix confirmé
- ✅ **Supabase** : Solution recommandée
- ✅ **TypeScript obligatoire** : Non négociable

**Conseil principal :**
> **"Bien penser à sécuriser ses fichiers, c'est le plus important"**

**Points d'attention :**
1. **Sécurité fichiers** : Chiffrement dès le début
2. **RLS maîtrise** : Investir temps dans l'apprentissage
3. **Optimisation images** : Compression obligatoire
4. **Tests** : Implémenter dès le début (notre retard)
5. **Monitoring** : Métriques essentielles pour scalabilité

**Technologies à considérer :**
- ✅ Expo pour React Native (vs CLI)
- ✅ Supabase vs Firebase (meilleur pour PostgreSQL)
- ✅ Zustand vs Redux (simplicité)
- ⚠️ NativeWind vs StyleSheet (compromis acceptable)

### Opportunités techniques futures

**Court terme (Q1-Q2 2025) :**
- Support vidéos avec optimisation avancée
- Tests automatisés complets
- Monitoring et observabilité

**Moyen terme (Q3-Q4 2025) :**
- Chat temps réel multiutilisateurs
- Intelligence artificielle (recommandations, modération)
- Internationalisation

**Long terme (2026+) :**
- Architecture microservices
- Déploiement multi-région
- Features avancées (AR, ML)

---

## Conclusion

Derkap représente une réussite technique avec une stack moderne et évolutive. L'architecture React Native + Next.js + Supabase s'est révélée parfaitement adaptée aux besoins, permettant un développement rapide tout en maintenant sécurité et performance.

**Facteurs clés de succès :**
- Choix technologiques alignés avec les compétences équipe
- Sécurité by design (chiffrement, RLS)
- Architecture modulaire et maintenable
- Déploiement automatisé

**Prêt pour la croissance :** 
L'infrastructure actuelle supporte la phase 0-50k utilisateurs et la roadmap technique est claire pour les phases suivantes.