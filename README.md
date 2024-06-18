# Camagru
WIP


. Planification et Conception
Définir les fonctionnalités :

Inscription et connexion des utilisateurs.
Création de photo-montages.
Partage de photo-montages.
Voir les photo-montages des autres utilisateurs.
Interaction avec les photo-montages (like, commentaire).
Structure de la base de données :

Utilisateurs : id, nom, email, mot de passe.
Photo-montages : id, utilisateur_id, titre, image_path, date de création.
Commentaires : id, montage_id, utilisateur_id, contenu, date de création.
Likes : id, montage_id, utilisateur_id.
Wireframes et maquettes :

Conception des interfaces utilisateur pour les différentes pages (inscription, connexion, création de montage, fil d'actualité, profil utilisateur, etc.).
2. Mise en Place de l'Environnement
Choix de la stack technologique :

Frontend : HTML, CSS, JavaScript.
Backend : PHP ou Node.js.
Base de données : MySQL ou SQLite.
Configuration de l'environnement de développement :

Serveur local (XAMPP, WAMP pour PHP, ou Node.js pour JavaScript).
3. Développement
Frontend :

Création des pages HTML pour les différentes vues.
Utilisation de CSS pour le style et la mise en page.
Utilisation de JavaScript pour la logique côté client (ajouter des fonctionnalités dynamiques comme la validation de formulaire, l'aperçu des montages, etc.).
Backend :

Gestion des routes (inscription, connexion, création de montage, etc.).
Gestion de la sécurité (hashage des mots de passe, validation des entrées, etc.).
Interactions avec la base de données (inscription des utilisateurs, sauvegarde des montages, etc.).
4. Fonctionnalités Avancées
Gestion des sessions :

Utilisation de sessions pour maintenir les utilisateurs connectés.
Téléchargement et manipulation d'images :

Fonctionnalité de téléchargement d'images pour les photo-montages.
Utilisation de bibliothèques comme GD ou ImageMagick en PHP pour manipuler les images.
Commentaires et Likes :

Ajout de la possibilité de commenter et liker les photo-montages.
Mise à jour en temps réel des likes et commentaires avec AJAX.
5. Test et Déploiement
Tests :

Tests unitaires pour les fonctions critiques.
Tests d'intégration pour s'assurer que toutes les parties du site fonctionnent bien ensemble.
Tests de performance pour vérifier la rapidité et la réactivité du site.
Déploiement :

Hébergement du site sur un serveur.
Configuration du nom de domaine et du certificat SSL.