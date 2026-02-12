# Sentiment Analysis Algorithm

This document provides a detailed overview of the sentiment analysis algorithm used in the MOODS project to categorize user emotions based on text input.

## Overview

The sentiment analysis service utilizes a **Naive Bayes Classifier** provided by the [`natural`](https://www.npmjs.com/package/natural) library. This is a probabilistic classifier that applies Bayes' theorem with strong independence assumptions between features.

## Technical Details

### Algorithm: Naive Bayes
The classifier is trained to associate specific words and phrases with various emotional labels (e.g., happy, angry, calm, sad, worried).

### Feature Extraction: Porter Stemmer
To improve accuracy, the service uses the **Porter Stemmer** algorithm. Stemming reduces words to their root form (e.g., "happily", "happiness", and "happy" all become "happi"), which helps the classifier recognize similarities regardless of word tense or plurality.

### Training Process
- **Data Source**: `backend/src/data/mood_training.json`
- **Dataset Size**: Growing (currently ~6.3k unique entries).
- **Initialization**: The model is trained synchronously upon the first request or when explicitly initialized.

## Organic Learning (Feedback Loop)

The system is designed to grow and improve organically based on real user behavior. When a user corrects a suggested mood in the **New Post** screen (or any future integrated screen), the application automatically logs this correction.

### How it Works
1. **AI Suggestion**: As a user types their post, the system automatically suggests a mood.
2. **User Correction**: If the user manually selects a different mood than the one suggested, the system detects this.
3. **Logging**: The `PostService` (and `MoodService`) detects the correction and logs the text and the correct label to the `sentiment_feedback` collection in Firestore.
4. **Synchronization**: Developers can sync this feedback back into the core training file.

### How to Sync Feedback
To merge user corrections into the main training dataset, run:

```bash
cd backend
npx ts-node -r tsconfig-paths/register src/scripts/update-brain.ts
```

This script will:
- Download all new unique corrections from Firestore.
- Append them to `src/data/mood_training.json`.
- Delete the processed entries from Firestore to keep it clean.

Running this script regularly will help the model reach the **100k+ dataset** goal using high-quality, real-world data from your users.

## Component Structure

- **Service**: [sentiment.service.ts](file:///Users/bishwasharma/Desktop/Projects/MOODS/backend/src/services/sentiment.service.ts) - Handles initialization, training, and classification logic.
- **Controller**: [moods.controller.ts](file:///Users/bishwasharma/Desktop/Projects/MOODS/backend/src/controllers/moods.controller.ts) - Exposes the `analyzeMood` endpoint.
- **Data**: [mood_training.json](file:///Users/bishwasharma/Desktop/Projects/MOODS/backend/src/data/mood_training.json) - Contains the labeled training dataset.
- **Sync Script**: [update-brain.ts](file:///Users/bishwasharma/Desktop/Projects/MOODS/backend/src/scripts/update-brain.ts) - Utility to sync user feedback into the training set.
- **Test Script**: [check-sentiment.ts](file:///Users/bishwasharma/Desktop/Projects/MOODS/backend/src/scripts/check-sentiment.ts) - A utility to verify the classifier's performance locally.

## How to Test

You can test the algorithm with various inputs using the provided script:

```bash
cd backend
npx ts-node -r tsconfig-paths/register src/scripts/check-sentiment.ts
```
