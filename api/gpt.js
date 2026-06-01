const axios = require('axios');

exports.config = {
    name: "gpt",
    version: "1.1.0",
    author: "Delfa frost",
    description: "Génère des réponses en utilisant l'IA officielle de Mistral AI.",
    method: 'get',
    link: [`/gpt?q=`],
    guide: "ai Comment fonctionne l'informatique quantique ?",
    category: "ai"
};

exports.initialize = async ({ req, res, font }) => {
    const query = req.query.q;

    if (!query) {
        return res.status(400).json({ error: "Aucun prompt fourni." });
    }

    // Configuration de l'API Mistral AI
    const baseUrl = "https://api.mistral.ai/v1/chat/completions";
    const apiKey = "DBzGcKeR3nVbyrh4u8ib4VrnXouLjYNk"; 

    const body = {
        model: "mistral-small-latest", 
        messages: [
            {
                role: "user",
                content: query
            }
        ],
        temperature: 0.7
    };

    try {
        const response = await axios.post(baseUrl, body, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        if (response.data && response.data.choices && response.data.choices[0]) {
            let answer = response.data.choices[0].message.content;
            
            // Formatage sécurisé du texte si la fonction 'font.bold' existe
            if (font && typeof font.bold === 'function') {
                answer = answer.replace(/\*\*(.*?)\*\*/g, (_, text) => font.bold(text));
            }

            return res.json({
                message: answer,
                author: exports.config.author
            });
        } else {
            throw new Error('Le format de réponse retourné par Mistral est invalide');
        }

    } catch (error) {
        console.error('Erreur lors de la récupération Mistral AI:', error.response ? error.response.data : error.message);
        return res.status(500).json({ 
            error: "Service indisponible", 
            details: "Impossible de récupérer une réponse auprès de l'API Mistral." 
        });
    }
};
