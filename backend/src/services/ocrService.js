const Tesseract = require('tesseract.js');

class OCRService {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.worker = await Tesseract.createWorker();
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
      this.isInitialized = true;
      console.log('OCR Service initialized');
    } catch (error) {
      console.error('OCR initialization error:', error);
      throw error;
    }
  }

  async extractText(imageData) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Remove data URL prefix if present
      const cleanImageData = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

      const result = await this.worker.recognize(Buffer.from(cleanImageData, 'base64'));
      
      return {
        success: true,
        text: result.data.text.trim(),
        confidence: result.data.confidence,
        words: result.data.words,
      };
    } catch (error) {
      console.error('OCR extraction error:', error);
      return {
        success: false,
        error: error.message,
        text: '',
      };
    }
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}

module.exports = new OCRService(); 