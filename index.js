const express = require("express");
const secure = require('ssl-express-www');
const cors = require("cors");
const path = require("path");
const helmet = require('helmet');
const compression = require('compression');
const log = require("./includes/log");
const config = require("./config.json");

// Initialisation de la configuration globale
global.config = config;
global.api = new Map();

const app = express();

// 1. Sécurité & Performance (Doit s'exécuter en premier)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(compression());

// 2. Redirection SSL & CORS (Doivent s'exécuter AVANT de définir les routes)
app.use(secure);
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Analyseurs de requêtes (Body Parsers intégrés à Express)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Fichiers statiques
app.use(express.static(path.join(__dirname, 'includes', 'public'), { maxAge: '1d', etag: true }));
app.use(express.static(path.join(__dirname, 'includes', 'web'), { maxAge: '1d', etag: true }));

// Configuration du serveur
app.enable('trust proxy');
app.set("json spaces", 2);

// Exposer la config au frontend
app.get("/config", (req, res) => {
  res.json(config);
});

// Liste des API fonctionnelles
app.get("/api-list", (req, res) => {
  try {
    const apiList = Array.from(global.api.values()).map(api => ({
      name: api.config.name,
      description: api.config.description,
      endpoint: `/api${api.config.link || api.meta.path}`,
      category: api.config.category
    }));
    res.json(apiList);
  } catch (error) {
    log.error('Erreur génération liste API:', error);
    res.status(500).json({ 
      error: 'Erreur interne du serveur',
      message: 'Impossible de générer la liste des API'
    });
  }
});

// Routeur principal contenant vos fichiers d'API (comme gpt.js et art.js)
const router = require("./includes/router");
app.use(router);

// Route d'accueil principale
app.get("/", (req, res) => {
  try {
    res.sendFile(path.join(__dirname, "includes", "public", "index.html"));
  } catch (error) {
    log.error('Erreur chargement page index:', error);
    res.status(500).send('Erreur interne du serveur');
  }
});

// Gestion des erreurs 404
app.use((req, res) => {
  try {
    res.status(404).sendFile(path.join(__dirname, "includes", "public", "404.html"));
  } catch (error) {
    log.error('Erreur chargement page 404:', error);
    res.status(404).send('Page non trouvée');
  }
});

// Gestionnaire d'erreurs global de l'application
app.use((err, req, res, next) => {
  log.error('Erreur serveur critique:', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'production' ? 'Une erreur est survenue' : err.message
  });
});

// Initialisation et démarrage du serveur
const PORT = process.env.PORT || global.config.port || 3000;
const server = app.listen(PORT, () => {
  log.main(`Le serveur tourne sur le port ${PORT}`);
});

// Arrêt propre du processus (Graceful shutdown)
process.on('SIGTERM', () => {
  log.main('Signal SIGTERM reçu : fermeture du serveur HTTP');
  server.close(() => {
    log.main('Serveur HTTP fermé avec succès');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  log.error('Exception non gérée:', error);
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  log.error('Rejet de promesse non géré à:', promise, 'raison:', reason);
});

module.exports = app;
      
