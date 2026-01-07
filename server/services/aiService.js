const { GoogleGenAI } = require('@google/genai');
const Settings = require('../models/Settings');

class AIService {
    constructor() {
        this.client = null;
        this.modelName = 'gemini-1.5-flash'; // Default
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
            const apiKey = await Settings.get(this.db, 'gemini_api_key');
            const model = await Settings.get(this.db, 'gemini_model');

            if (model) {
                this.modelName = model;
            }

            const key = apiKey || process.env.GEMINI_API_KEY;

            if (key) {
                this.client = new GoogleGenAI({ apiKey: key });
                console.log(`AI Service initialized (New SDK) with model: ${this.modelName}`);
            } else {
                console.warn('AI Service: No API key found');
            }
        } catch (error) {
            console.error('AI Service initialization error:', error.message);
        }
    }

    async generateContent(prompt) {
        await this.initialize();
        if (!this.client) throw new Error('AI Service not configured');

        try {
            const response = await this.client.models.generateContent({
                model: this.modelName,
                contents: prompt,
                config: {
                    // responseModalities: ['TEXT'] // Default
                }
            });
            return response.text();
        } catch (error) {
            console.error('AI Text Gen Error:', error);
            throw error;
        }
    }

    async generateVideoMetadata(title) {
        const prompt = `Generate a SEO-friendly description and 5 tags for a video titled "${title}". Return as JSON with keys "description" and "tags" (array).`;
        const text = await this.generateContent(prompt);
        try {
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (e) {
            return { description: text, tags: [] };
        }
    }

    async categorizeVideo(title, description) {
        const prompt = `Categorize the following video into one of these categories: Development, Design, Marketing. Video Title: "${title}", Description: "${description}". Return ONLY the category name.`;
        try {
            const text = await this.generateContent(prompt);
            return text.trim();
        } catch (error) {
            console.error('Error in categorizeVideo:', error);
            return 'Development';
        }
    }

    // New: Image Generation (Thumbnail)
    async generateImage(prompt) {
        await this.initialize();
        if (!this.client) throw new Error('AI Service not configured');

        try {
            // Using Imagen model or Gemini Image model
            const model = 'gemini-3-pro-image-preview'; // Or 'imagen-3.0-generate-001'
            const response = await this.client.models.generateContent({
                model: model,
                contents: { parts: [{ text: prompt }] },
                config: {
                    // imageConfig: { aspectRatio: '16:9' } // If supported by SDK typings
                }
            });

            // Extract image data (base64)
            // The structure might vary based on model response
            const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
            throw new Error('No image generated');
        } catch (error) {
            console.error('AI Image Gen Error:', error);
            throw error;
        }
    }

    // New: Video Generation
    async generateVideo(prompt) {
        await this.initialize();
        if (!this.client) throw new Error('AI Service not configured');

        try {
            const model = 'veo-3.1-fast-generate-preview'; // Or user selected
            // generateVideos might return an Operation
            // Note: The @google/genai SDK syntax for video might differ.
            // Based on example: ai.models.generateVideos(...)

            let operation = await this.client.models.generateVideos({
                model: model,
                prompt: prompt,
                config: { numberOfVideos: 1 }
            });

            // Polling
            // In a real server context, we shouldn't block.
            // But for simplicity/demo:
            while (!operation.done) {
                await new Promise(r => setTimeout(r, 5000));
                operation = await this.client.operations.getVideosOperation({ operation });
            }

            const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
            return videoUri; // This is a URI, might need downloading or proxying.
        } catch (error) {
            console.error('AI Video Gen Error:', error);
            throw error;
        }
    }
}

module.exports = new AIService();
