const { GoogleGenerativeAI } = require('@google/generative-ai');
const Settings = require('../models/Settings');

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
            // Use v1beta API version which supports newer models like gemini-1.5-flash
            const model = this.client.getGenerativeModel({
                model: this.modelName,
                apiVersion: 'v1beta'
            });

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

    // Method to categorize video
    async categorizeVideo(title, description) {
        const prompt = `Categorize the following video into one of these categories: Development, Design, Marketing. Video Title: "${title}", Description: "${description}". Return ONLY the category name.`;
        try {
            const text = await this.generateContent(prompt);
            return text.trim();
        } catch (error) {
            console.error('Error in categorizeVideo:', error);
            // Return default or null
            return 'Development';
        }
    }
}

module.exports = new AIService();
