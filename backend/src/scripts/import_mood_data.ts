import fs from 'fs';
import path from 'path';

// Define paths
const ARCHIVE_DIR = path.join('C:', 'BISHWA', 'archive (1)');
const TARGET_FILE = path.join(__dirname, '..', 'data', 'mood_training.json');

// Define label mapping
const LABEL_MAP: Record<string, string> = {
    'joy': 'happy',
    'sadness': 'sad',
    'anger': 'angry',
    'love': 'love',
    'fear': 'anxious',
    // 'surprise' is skipped
};

interface MoodEntry {
    text: string;
    label: string;
}

// Function to process a single file
function processFile(filePath: string): MoodEntry[] {
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return [];
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const entries: MoodEntry[] = [];

    for (const line of lines) {
        if (!line.trim()) continue;

        const parts = line.split(';');
        if (parts.length !== 2) continue;

        const text = parts[0].trim();
        const sourceLabel = parts[1].trim();
        const targetLabel = LABEL_MAP[sourceLabel];

        if (targetLabel) {
            entries.push({ text, label: targetLabel });
        }
    }

    return entries;
}

// Main execution
function main() {
    console.log('Starting mood data import...');

    // 1. Read existing data
    let existingData: MoodEntry[] = [];
    if (fs.existsSync(TARGET_FILE)) {
        try {
            const fileContent = fs.readFileSync(TARGET_FILE, 'utf-8');
            existingData = JSON.parse(fileContent);
            console.log(`Loaded ${existingData.length} existing entries.`);
        } catch (error) {
            console.error('Error reading existing entries:', error);
            // Backup just in case
            if (fs.existsSync(TARGET_FILE)) {
                fs.copyFileSync(TARGET_FILE, `${TARGET_FILE}.bak`);
            }
        }
    }

    // 2. Process new files
    const filesToProcess = ['train.txt', 'val.txt', 'test.txt'];
    let newEntriesCount = 0;

    for (const fileName of filesToProcess) {
        const filePath = path.join(ARCHIVE_DIR, fileName);
        console.log(`Processing ${fileName}...`);
        const entries = processFile(filePath);
        existingData.push(...entries);
        newEntriesCount += entries.length;
        console.log(`  Added ${entries.length} entries from ${fileName}.`);
    }

    // 3. Write back to file
    console.log(`Total entries after import: ${existingData.length}`);
    fs.writeFileSync(TARGET_FILE, JSON.stringify(existingData, null, 4));
    console.log(`Successfully wrote data to ${TARGET_FILE}`);
}

main();
