import { SentimentService } from "../services/sentiment.service";

const run = async () => {
    console.log("Initializing Sentiment Service...");
    await SentimentService.initialize();

    const examples = [
        "I am so happy!",
        "This is the worst day of my life.",
        "I feel very calm and peaceful.",
        "I am so angry at the traffic!",
        "I love you so much.",
        "I am tired and want to sleep.",
        "I am worried about the future."
    ];

    for (const text of examples) {
        const mood = await SentimentService.analyze(text);
        console.log(`Text: "${text}" -> Mood: ${mood}`);
    }
};

run().catch(console.error);
