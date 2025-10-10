# Guide des Tests avec Jest

## 📋 Table des matières
- [Introduction](#introduction)
- [Configuration](#configuration)
- [Exécution des tests](#exécution-des-tests)
- [Structure des tests](#structure-des-tests)
- [Tests créés](#tests-créés)
- [Bonnes pratiques](#bonnes-pratiques)

## 🎯 Introduction

Ce projet utilise **Jest** comme framework de test. Jest est un framework de test JavaScript moderne, rapide et facile à utiliser, particulièrement adapté pour les applications Angular.

### Pourquoi Jest ?
- ⚡ **Rapide** : Exécution parallèle des tests
- 📸 **Snapshot testing** : Capture l'état des composants
- 🔍 **Coverage** : Rapport de couverture de code intégré
- 🎯 **Simple** : Configuration minimale requise
- 🛠️ **Moderne** : Meilleures pratiques intégrées

## ⚙️ Configuration

### Fichiers de configuration

#### `jest.config.js`
Fichier principal de configuration de Jest pour Angular :
- Utilise le preset `jest-preset-angular`
- Configure la couverture de code
- Définit les transformations TypeScript
- Ignore les dossiers `node_modules` et `dist`

#### `setup-jest.ts`
Fichier d'initialisation qui configure :
- L'environnement de test Angular
- Les matchers personnalisés de `@testing-library/jest-dom`

#### `tsconfig.spec.json`
Configuration TypeScript pour les tests :
- Types Jest au lieu de Jasmine
- Options de compilation spécifiques aux tests

## 🚀 Exécution des tests

### Commandes disponibles

```bash
# Exécuter tous les tests une fois
npm test

# Exécuter les tests en mode watch (re-exécution automatique)
npm run test:watch

# Exécuter les tests avec rapport de couverture
npm run test:coverage
```

### Exécuter des tests spécifiques

```bash
# Tester un fichier spécifique
npm test -- chat.service.spec.ts

# Tester avec un pattern
npm test -- --testNamePattern="devrait envoyer"

# Mode verbose pour plus de détails
npm test -- --verbose
```

## 📁 Structure des tests

Chaque fichier de test suit la convention Angular :
- Nom : `*.spec.ts`
- Emplacement : À côté du fichier testé

### Organisation d'un fichier de test

```typescript
describe('NomDuComposant/Service', () => {
  // Variables pour le test
  let component: MonComponent;
  let fixture: ComponentFixture<MonComponent>;

  // Configuration avant chaque test
  beforeEach(async () => {
    // Configuration du module de test
  });

  // Tests individuels
  it('devrait faire quelque chose', () => {
    // Arrange : Préparer les données
    // Act : Exécuter l'action
    // Assert : Vérifier le résultat
  });
});
```

## 📝 Tests créés

### 1. ChatService Tests (`chat.service.spec.ts`)

**Objectif** : Tester le service de gestion WebSocket et des messages

**Tests inclus** :
- ✅ Création du service
- ✅ État initial de connexion (déconnecté)
- ✅ État initial des messages (liste vide)
- ✅ Méthode `isConnected()`
- ✅ Configuration de l'URL WebSocket
- ✅ Déconnexion sans connexion active
- ✅ Structure des messages de chat
- ✅ Support des types de messages (JOIN, LEAVE, CHAT)
- ✅ Support des rôles (CLIENT, SUPPORT)
- ✅ Initialisation du tableau de messages
- ✅ État du client STOMP

**Exemple de test** :
```typescript
/**
 * Test de l'état initial de connexion
 * Vérifie que le service n'est pas connecté au démarrage
 */
it('devrait être déconnecté au départ', (done) => {
  service.connected$.subscribe(connected => {
    expect(connected).toBe(false);
    done();
  });
});
```

### 2. ConnectionComponent Tests (`connection.component.spec.ts`)

**Objectif** : Tester le composant de connexion au chat

**Tests inclus** :
- ✅ Création du composant
- ✅ État initial (déconnecté)
- ✅ Initialisation du formulaire
- ✅ Exposition des enums au template
- ✅ Validation du nom d'utilisateur (vide, espaces)
- ✅ Connexion réussie
- ✅ Connexion avec rôle SUPPORT
- ✅ Gestion des erreurs de connexion
- ✅ Mise à jour de l'état via observable
- ✅ Émission de l'événement de déconnexion
- ✅ Méthode `disconnect()`
- ✅ Nettoyage du nom (trim)
- ✅ Sauvegarde du rôle sélectionné

**Exemple de test** :
```typescript
/**
 * Test de connexion avec un nom d'utilisateur vide
 * Vérifie que la connexion est bloquée si le nom est vide
 */
it('ne devrait pas permettre la connexion avec un nom vide', () => {
  component.username = '';
  spyOn(window, 'alert');

  component.connect();

  expect(window.alert).toHaveBeenCalledWith('Veuillez entrer votre nom');
  expect(mockChatService.connect).not.toHaveBeenCalled();
});
```

### 3. ChatComponent Tests (`chat.component.spec.ts`)

**Objectif** : Tester le composant de messagerie

**Tests inclus** :
- ✅ Création du composant
- ✅ Initialisation de la liste de messages
- ✅ Initialisation du champ de saisie
- ✅ Exposition des enums
- ✅ Réception des messages via observable
- ✅ Envoi d'un message
- ✅ Validation des messages (vide, espaces)
- ✅ Nettoyage des espaces (trim)
- ✅ Gestion de la touche Entrée
- ✅ Gestion de Shift+Entrée
- ✅ Identification des messages propres (`isOwnMessage`)
- ✅ Classes CSS pour messages (system, own, client, support)
- ✅ Méthode `disconnect()`
- ✅ Nettoyage des souscriptions (`ngOnDestroy`)
- ✅ Mise à jour en temps réel
- ✅ Messages d'utilisateur support
- ✅ Gestion des timestamps

**Exemple de test** :
```typescript
/**
 * Test de la touche Entrée pour envoyer un message
 * Vérifie que la touche Entrée déclenche l'envoi
 */
it('devrait envoyer le message quand on appuie sur Entrée', () => {
  component.messageContent = 'Test message';
  const event = new KeyboardEvent('keypress', { key: 'Enter' });
  spyOn(event, 'preventDefault');
  spyOn(component, 'sendMessage');

  component.onKeyPress(event);

  expect(event.preventDefault).toHaveBeenCalled();
  expect(component.sendMessage).toHaveBeenCalled();
});
```

## 🎯 Bonnes pratiques

### 1. Structure AAA (Arrange-Act-Assert)
```typescript
it('devrait faire quelque chose', () => {
  // Arrange : Préparer les données de test
  const testData = 'test';

  // Act : Exécuter l'action
  const result = component.doSomething(testData);

  // Assert : Vérifier le résultat
  expect(result).toBe('expected');
});
```

### 2. Commentaires clairs
Chaque test a :
- Un commentaire JSDoc expliquant son objectif
- Une description claire avec `it('devrait...')`

### 3. Isolation des tests
- Chaque test est indépendant
- Utilisation de `beforeEach` pour la configuration
- Pas de dépendances entre les tests

### 4. Mocking approprié
- Utilisation de `jasmine.createSpyObj` pour les services
- Simulation des observables avec `BehaviorSubject`
- Espionnage des méthodes avec `spyOn`

### 5. Tests asynchrones
```typescript
it('devrait gérer une promesse', async () => {
  mockService.method.and.returnValue(Promise.resolve());

  component.asyncMethod();

  await fixture.whenStable();
  expect(component.state).toBe('updated');
});
```

### 6. Couverture de code
Visez une couverture de :
- **80%+** pour les fonctions critiques
- **70%+** pour le code global
- **100%** pour la logique métier importante

## 📊 Rapport de couverture

Après avoir exécuté `npm run test:coverage`, ouvrez :
```
coverage/index.html
```

Le rapport montre :
- **Statements** : Pourcentage de lignes exécutées
- **Branches** : Pourcentage de branches (if/else) testées
- **Functions** : Pourcentage de fonctions testées
- **Lines** : Pourcentage de lignes de code testées

## 🔧 Debugging

### Exécuter un seul test
```typescript
// Utiliser 'fit' au lieu de 'it'
fit('devrait être testé uniquement', () => {
  // ...
});
```

### Ignorer un test
```typescript
// Utiliser 'xit' au lieu de 'it'
xit('devrait être ignoré temporairement', () => {
  // ...
});
```

### Voir les logs
```bash
npm test -- --verbose --no-coverage
```

## 📚 Ressources

- [Documentation Jest](https://jestjs.io/)
- [Jest Preset Angular](https://github.com/thymikee/jest-preset-angular)
- [Testing Library Angular](https://testing-library.com/docs/angular-testing-library/intro/)
- [Guide de test Angular](https://angular.dev/guide/testing)

## ✅ Checklist avant commit

- [ ] Tous les tests passent (`npm test`)
- [ ] Couverture de code acceptable (`npm run test:coverage`)
- [ ] Les nouveaux tests ont des commentaires clairs
- [ ] Pas de tests ignorés (`xit` ou `xdescribe`) sans raison
- [ ] Les tests sont rapides (< 1s par test en moyenne)
