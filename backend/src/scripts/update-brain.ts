import * as fs from 'fs';
import * as path from 'path';
import { db } from '../config/firebase';

const updateBrain = async () => {
    console.log('--- Sentiment Analysis Organic Learning Sync ---');

    const feedbackRef = db.collection('sentiment_feedback');
    const snapshot = await feedbackRef.get();

    if (snapshot.empty) {
        console.log('No new feedback found in Firestore.');
        return;
    }

    console.log(`Found ${snapshot.size} new feedback entries.`);

    const dataPath = path.join(__dirname, '../data/mood_training.json');
    const currentData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    // Create a set of existing texts for fast lookup (to avoid duplicates)
    const existingTexts = new Set(currentData.map((item: any) => item.text.toLowerCase().trim()));

    let addedCount = 0;
    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
        const feedback = doc.data();
        const cleanText = feedback.text.trim();
        const normalizedText = cleanText.toLowerCase();

        // Only add if it doesn't already exist in the training data
        if (!existingTexts.has(normalizedText)) {
            currentData.push({
                text: cleanText,
                label: feedback.label
            });
            existingTexts.add(normalizedText);
            addedCount++;
        }

        // Mark for deletion from Firestore after processing
        batch.delete(doc.ref);
    });

    if (addedCount > 0) {
        fs.writeFileSync(dataPath, JSON.stringify(currentData, null, 2));
        await batch.commit();
        console.log(`Successfully added ${addedCount} new unique training examples to mood_training.json`);
        console.log(`Total training entries now: ${currentData.length}`);
    } else {
        console.log('All feedback entries were already present in the training data.');
        // Still clear the batch to clean up duplicates in Firestore
        await batch.commit();
    }

    console.log('Sync complete.');
};

updateBrain().catch(console.error);
