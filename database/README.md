Your Car Your Way - Base de données MySQL

📋 Description
Ce dossier contient tous les scripts SQL nécessaires pour créer et initialiser la base de données MySQL de l'application Your Car Your Way.

📁 Fichiers disponibles
FichierDescriptionschema.sqlCréation de toutes les tables avec leurs contraintesindexes.sqlCréation des index de performanceseed-data.sqlDonnées de test pour le développement

🚀 Installation rapide
Prérequis

MySQL 8.0 ou supérieur
Accès root ou utilisateur avec privilèges CREATE/INSERT

Étape 1 : Créer la base de données
bashmysql -u root -p
sqlCREATE DATABASE yourcaryourway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yourcaryourway;
Étape 2 : Exécuter les scripts dans l'ordre
bash# 1. Créer les tables
mysql -u root -p yourcaryourway < schema.sql

# 2. Créer les index
mysql -u root -p yourcaryourway < indexes.sql

# 3. (Optionnel) Insérer les données de test
mysql -u root -p yourcaryourway < seed-data.sql

🔍 Vérification de l'installation
Vérifier que les tables sont créées
sqlUSE yourcaryourway;
SHOW TABLES;
Résultat attendu :
+---------------------------+
| Tables_in_yourcaryourway  |
+---------------------------+
| consent                   |
| document                  |
| driver_license            |
| location                  |
| payment                   |
| payment_method            |
| rate_plan                 |
| reservation               |
| reservation_option        |
| user                      |
| vehicle                   |
+---------------------------+
Vérifier les données de test
sqlSELECT COUNT(*) AS nb_users FROM user;
SELECT COUNT(*) AS nb_locations FROM location;
SELECT COUNT(*) AS nb_vehicles FROM vehicle;

📊 Structure de la base de données
Tables principales
user
Stocke les informations des clients

email (unique)
mot de passe (haché)
informations personnelles
préférences (langue, devise)

location
Agences de location

pays, ville, aéroport
coordonnées
timezone

vehicle
Véhicules disponibles

catégorie ACRISS
caractéristiques (marque, modèle, transmission, carburant)
disponibilité

reservation
Réservations des clients

dates de prise et de retour
statut (PENDING, CONFIRMED, CANCELLED, etc.)
snapshot JSON de l'offre
idempotency_key (pour éviter les doublons)

payment
Paiements des réservations

intégration PSP (Stripe/Adyen)
statut du paiement
idempotency_key

document
Documents générés (contrats, factures)

URL vers le stockage S3/MinIO
type de document


🔐 Données de test
Comptes utilisateurs de test
EmailMot de passePaysjohn.doe@example.compassword123USAmarie.dupont@example.frpassword123Francecarlos.garcia@example.espassword123Spain

Note : Le mot de passe haché dans la base correspond à password123

Agences disponibles

New York JFK (USA)
Los Angeles LAX (USA)
Paris Charles de Gaulle (France)
Madrid Barajas (Espagne)
London Heathrow (UK)

Véhicules disponibles
Chaque agence dispose de plusieurs véhicules de différentes catégories :

Économique (ECMR) : Toyota Corolla, Renault Clio
Intermédiaire (ICAR) : Honda Accord, Peugeot 308
Standard (SFAR) : BMW 3 Series
Cabriolet (CDAR) : Ford Mustang
Électrique (FVAR) : Tesla Model 3
Premium (PCAR) : Jaguar XE


🛡️ Sécurité et conformité
RGPD/CCPA

Table consent pour gérer les consentements
Adresse IP enregistrée pour l'audit
Stratégie de suppression/anonymisation supportée

Idempotence
Les tables reservation et payment ont des colonnes idempotency_key (UNIQUE) pour éviter les doublons lors de requêtes POST multiples.
Audit trail

Timestamps created_at et updated_at sur toutes les tables critiques
Historique des modifications de réservation


🔧 Maintenance
Backup
bash# Backup complet
mysqldump -u root -p yourcaryourway > backup_$(date +%Y%m%d).sql

# Backup structure uniquement
mysqldump -u root -p --no-data yourcaryourway > structure_backup.sql
Restauration
bashmysql -u root -p yourcaryourway < backup_20251006.sql
Réinitialisation complète
bashmysql -u root -p
sqlDROP DATABASE IF EXISTS yourcaryourway;
CREATE DATABASE yourcaryourway CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE yourcaryourway;
SOURCE schema.sql;
SOURCE indexes.sql;
SOURCE seed-data.sql;

📈 Performance
Index créés
Les index suivants sont créés automatiquement par indexes.sql :

user : email, created_at
location : country_code + city, code_iata
vehicle : location_id + acriss_code, available
reservation : user_id + created_at, status + start_at
payment : reservation_id, status + created_at

Ces index optimisent les requêtes les plus fréquentes :

Recherche d'agences par pays/ville
Liste des véhicules disponibles
Historique des réservations par client
Suivi des paiements


🐛 Dépannage
Erreur : "Access denied"
bash# Vérifier les droits de l'utilisateur
mysql -u root -p -e "SHOW GRANTS;"
Erreur : "Table already exists"
bash# Supprimer la base et recréer
mysql -u root -p -e "DROP DATABASE IF EXISTS yourcaryourway;"
mysql -u root -p -e "CREATE DATABASE yourcaryourway;"
Erreur : "Foreign key constraint fails"
bash# Vérifier que les tables sont créées dans le bon ordre
# L'ordre dans schema.sql est correct (tables parentes avant tables enfants)

📞 Support
Pour toute question sur la base de données, contactez l'équipe technique de Your Car Your Way.

📝 Changelog
Version 1.0 (Octobre 2025)

Création initiale du schéma
Support multi-pays et multi-devises
Conformité RGPD/CCPA
Idempotence sur réservations et paiements
Données de test pour 5 agences et 9 véhicules
