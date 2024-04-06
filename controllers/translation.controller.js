const Translation = require('../models/translation.model');

const translation = new Translation();

async function detectLanguage(req, res) {
    const { text } = req.params;
    try {
      const detectedLanguage = await translation.detectLanguage(text);
      res.json({ detectedLanguage });
    } catch (error) {
      console.error('Error detecting language:', error);
      res.status(500).json({ error: 'Error detecting language', message: error.message });
    }
  }
  
  async function translateText(req, res) {
    const { text, target } = req.params;
    try {
      const translatedText = await translation.translate(text, target);
      res.json({ translatedText });
    } catch (error) {
      console.error('Error translating text:', error);
      res.status(500).json({ error: 'Error translating text', message: error.message });
    }
  }
  

module.exports = {
  detectLanguage,
  translateText,
};