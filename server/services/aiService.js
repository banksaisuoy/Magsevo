const { GoogleGenerativeAI } = require('@google/generative-ai');
const Settings = require('../models/Settings');
// We might need Log too?
// If Log is not in Settings.js, we might need to import it from index or Log.js
// If we can't be sure, maybe we can skip logging in AI service for now, or assume index has Log.
// But AI Service implementation I wrote doesn't use Log.
// It uses console.warn/error.
// So I am fine.

class AIService {
    constructor() {
        this.client = null;
        this.modelName = 'gemini-1.5-flash'; // Default model
        this.db = null;
    }

    setDatabase(db) {
        this.db = db;
    }

    async initialize() {
        if (!this.db) {
            console.warn('AI Service: Database not set, skipping initialization');
            return;
        }

        try {
            // Fetch settings from database
            const apiKey = await Settings.get(this.db, 'gemini_api_key');
            const model = await Settings.get(this.db, 'gemini_model');

            if (model) {
                this.modelName = model;
            }

            if (apiKey) {
                this.client = new GoogleGenerativeAI(apiKey);
                console.log(`AI Service initialized with model: ${this.modelName}`);
            } else {
                // Fallback to environment variable
                const envKey = process.env.GEMINI_API_KEY;
                if (envKey) {
                    this.client = new GoogleGenerativeAI(envKey);
                    console.log(`AI Service initialized with env key and model: ${this.modelName}`);
                } else {
                    console.warn('AI Service: No API key found in settings or environment');
                }
            }
        } catch (error) {
            console.error('AI Service initialization error:', error.message);
        }
    }

    async generateContent(prompt) {
        // Re-initialize to ensure we have latest settings
        await this.initialize();

        if (!this.client) {
            throw new Error('AI Service not configured. Please add Gemini API Key in settings.');
        }

        try {
            const model = this.client.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error('AI Generation Error:', error);
            throw error;
        }
    }

    // Example method for video metadata generation
    async generateVideoMetadata(title) {
        const prompt = `Generate a SEO-friendly description and 5 tags for a video titled "${title}". Return as JSON with keys "description" and "tags" (array).`;
        const text = await this.generateContent(prompt);

        try {
            // Cleanup markdown code blocks if present
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            console.error('Failed to parse AI response as JSON:', text);
            return { description: text, tags: [] };
        }
    }
}

module.exports = new AIService();
