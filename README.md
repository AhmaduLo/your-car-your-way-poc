# Your Car Your Way - POC

Application de location de voitures avec système de chat en temps réel.

## Description

**Your Car Your Way** est une plateforme de location de véhicules qui permet aux utilisateurs de réserver des voitures dans différentes agences à travers le monde. Le projet inclut un système de chat en temps réel pour communiquer avec le support.

## Technologies utilisées

### Frontend
- **Angular 20** - Interface utilisateur moderne
- **TypeScript** - Langage de programmation
- **WebSocket / STOMP** - Communication en temps réel pour le chat

### Backend
- **Spring Boot 3.5** - Framework Java
- **WebSocket** - Chat en temps réel
- **Maven** - Gestion des dépendances

### Base de données
- **MySQL 8.0** - Base de données relationnelle
- Support multi-pays et multi-devises
- Conformité RGPD/CCPA

## Structure du projet

```
your-car-your-way-poc/
├── chat-poc/
│   ├── frontend/        # Application Angular
│   └── backend/         # API Spring Boot
└── database/            # Scripts SQL
    ├── schema.sql       # Structure de la base
    ├── indexes.sql      # Index de performance
    └── seed-data.sql    # Données de test
```

## Installation

### Prérequis
- Node.js 18+
- Java 17+
- Maven 3.8+
- MySQL 8.0+

### 1. Base de données

Créer la base de données :
```bash
mysql -u root -p
```

```sql
CREATE DATABASE yourcaryourway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yourcaryourway;
```

Importer les scripts :
```bash
cd database
mysql -u root -p yourcaryourway < schema.sql
mysql -u root -p yourcaryourway < indexes.sql
mysql -u root -p yourcaryourway < seed-data.sql
```

### 2. Backend (Spring Boot)

```bash
cd chat-poc/backend/your-car-your-way
mvn clean install
mvn spring-boot:run
```

Le serveur démarre sur `http://localhost:8080`

### 3. Frontend (Angular)

```bash
cd chat-poc/frontend/chat-poc
npm install
npm start
```

L'application est accessible sur `http://localhost:4200`

## Fonctionnalités

### Réservation de véhicules
- Recherche de véhicules par agence
- Sélection de dates de location
- Choix du véhicule (économique, premium, électrique, etc.)
- Réservation sécurisée

### Chat en temps réel
- Communication instantanée avec le support
- Notifications de messages
- Historique des conversations

### Gestion multi-agences
Agences disponibles dans les données de test :
- New York JFK (USA)
- Los Angeles LAX (USA)
- Paris Charles de Gaulle (France)
- Madrid Barajas (Espagne)
- London Heathrow (UK)

## Comptes de test

| Email | Mot de passe | Pays |
|-------|--------------|------|
| john.doe@example.com | password123 | USA |
| marie.dupont@example.fr | password123 | France |
| carlos.garcia@example.es | password123 | Espagne |

## Commandes utiles

### Frontend

```bash
# Démarrer en mode développement
npm start

# Lancer les tests
npm test

# Créer un build de production
npm run build
```

### Backend

```bash
# Lancer les tests
mvn test

# Vérifier la couverture de code
mvn clean test jacoco:report

# Créer un JAR
mvn package
```

### Base de données

```bash
# Backup de la base
mysqldump -u root -p yourcaryourway > backup.sql

# Réinitialiser la base
mysql -u root -p yourcaryourway < database/schema.sql
```

## Architecture

### Communication temps réel
Le chat utilise WebSocket avec le protocole STOMP :
- Le client Angular se connecte au serveur WebSocket
- Les messages sont envoyés via STOMP
- Le serveur diffuse les messages à tous les utilisateurs connectés

### Sécurité
- Mots de passe hachés dans la base
- Protection contre les doublons de réservation (idempotency)
- Conformité RGPD pour les données personnelles

## Développement

### Lancer tous les services

1. Démarrer MySQL
2. Lancer le backend : `mvn spring-boot:run`
3. Lancer le frontend : `npm start`
4. Accéder à l'application : `http://localhost:4200`

### Tests

Le projet inclut :
- Tests unitaires (Frontend : Jest, Backend : JUnit)
- Tests d'intégration
- Couverture de code avec JaCoCo (objectif : 70%)

## Support

Pour toute question ou problème, consultez la documentation dans le dossier `database/README.md` pour les détails sur la base de données.

## Version

**1.0** - Octobre 2025

Fonctionnalités initiales :
- Système de réservation
- Chat en temps réel
- Multi-agences et multi-pays
- Gestion des paiements
