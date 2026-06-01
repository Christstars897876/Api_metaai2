const axios = require('axios');

exports.config = {
  name: 'art',
  author: 'Delfa frost',
  description: 'Génère une image par IA via OpenAI DALL-E',
  method: 'get',
  category: 'image generation',
  link: ['/api/art?prompt=A cute cat']
};

exports.initialize = async function ({ req, res, log }) {
  try {
    const { prompt } = req.query;
    if (!prompt) {
      return res.status(400).json({ error: 'Le paramètre "prompt" est requis.' });
    }

    // Récupération de la clé API
    const apiKey = process.env.OPENAI_API_KEY || global.config.openaiApiKey;
    if (!apiKey) {
      return res.status(500).json({ error: "Clé OpenAI manquante." });
    }

    // Appel au modèle de génération d'images DALL-E
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "dall-e-2", // Économique et rapide
        prompt: prompt,
        n: 1,
        size: "512x512"
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        timeout: 20000
      }
    );

    const imageUrl = response.data?.data?.[0]?.url;

    if (imageUrl) {
      // Redirection directe vers l'image (Parfait pour Vercel et l'affichage direct sur le web)
      return res.redirect(imageUrl);
    } else {
      return res.status(500).json({ error: "Impossible de récupérer l'image depuis OpenAI." });
    }

  } catch (error) {
    if (log && log.error) log.error(`Erreur OpenAI Art (DALL-E): ${error.message}`);
    return res.status(500).json({ 
      error: "Échec de la génération de l'image.",
      details: error.response?.data?.error?.message || error.message
    });
  }
};

