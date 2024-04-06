const { Translate } = require('@google-cloud/translate').v2;

class Translation {
  constructor() {
    this.translateClient = new Translate();
  }

  async detectLanguage(text) {
    try {
      const [result] = await this.translateClient.detect(text);
      return result.language;
    } catch (error) {
      throw new Error('Error detecting language');
    }
  }

  async translate(text, targetLanguage) {
    try {
      const [translation] = await this.translateClient.translate(text, { target: targetLanguage });
      return translation;
    } catch (error) {
      throw new Error('Error translating text');
    }
  }
}

module.exports = Translation;
