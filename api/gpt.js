const axios = require('axios');

exports.config = {
    name: "gpt",
    version: "2.0.0",
    author: "Delfa frost",
    description: "Génère des réponses en utilisant l'API officielle OpenAI.",
    method: 'get',
    link: [`/api/gpt?q=`],
    category: "ai"
};

exports.initialize = async ({ req, res, log }) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: "Le paramètre de question 'q' est requis. Exemple: /api/gpt?q=Bonjour" });
    }

    // Récupération de la clé API depuis les variables d'environnement ou le fichier de configuration globale
    const apiKey = process.env.OPENAI_API_KEY || global.config.openaiApiKey;

    if (!apiKey) {
        return res.status(500).json({ 
            error: "Configuration manquante", 
            message: "La clé d'API OpenAI n'est pas configurée." 
        });
    }

    try {
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                "model": "gpt-3.5-turbo",
                "messages": [{ "role": "user", "content": query }],
                "temperature": 0.7
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                timeout: 15000
            }
        );
        
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const answer = response.data.choices[0].message.content.trim();
            return res.json({
                message: answer,
                author: exports.config.author
            });
        } else {
            throw new Error('Réponse vide ou invalide de la part d\'OpenAI.');
        }
    } catch (error) {
        if (log && log.error) log.error(`Erreur OpenAI GPT: ${error.message}`);
        
        return res.status(500).json({ 
            error: "Erreur lors de la génération de texte",
            details: error.response?.data?.error?.message || error.message
        });
    }
};
