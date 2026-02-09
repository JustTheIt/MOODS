import * as fs from 'fs';
import * as path from 'path';
const natural = require('natural');

export class SentimentService {
    private static classifier: any;
    private static isTrained = false;

    static async initialize() {
        if (this.isTrained) return;

        // Use PorterStemmer for better feature extraction
        this.classifier = new natural.BayesClassifier(natural.PorterStemmer);

        try {
            const dataPath = path.join(__dirname, '../data/mood_training.json');
            const rawData = fs.readFileSync(dataPath, 'utf-8');
            const trainingData = JSON.parse(rawData);

            trainingData.forEach((item: { text: string; label: string }) => {
                this.classifier.addDocument(item.text, item.label);
            });

            this.classifier.train();
            this.isTrained = true;
            console.log('Sentiment Analyzer trained successfully with PorterStemmer.');
        } catch (error) {
            console.error('Failed to train Sentiment Analyzer:', error);
        }
    }

    static async analyze(text: string): Promise<string> {
        if (!this.isTrained) {
            await this.initialize();
        }
        return this.classifier.classify(text);
    }
}
