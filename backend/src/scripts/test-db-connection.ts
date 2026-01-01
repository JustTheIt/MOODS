import { db } from '../config/firebase';

async function testConnection() {
    try {
        console.log('Testing Firestore connection...');
        const snapshot = await db.collection('posts').limit(1).get();
        console.log('✅ Connection successful!');
        console.log(`Found ${snapshot.size} documents in 'posts' collection.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error);
        process.exit(1);
    }
}

testConnection();
