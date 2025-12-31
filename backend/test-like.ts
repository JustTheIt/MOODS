import admin from 'firebase-admin';
import { db } from './src/config/firebase';

async function testToggleLike() {
    try {
        const postId = '1HgFhC7zSYr8PHxMbreO';
        const userId = 'test-user-' + Date.now();

        console.log(`Testing toggleLike for post ${postId} and user ${userId}...`);

        const postRef = db.collection('posts').doc(postId);
        const likeRef = postRef.collection('likes').doc(userId);

        await db.runTransaction(async (transaction) => {
            console.log("Transaction Start");
            const likeDoc = await transaction.get(likeRef);
            console.log("LikeDoc status:", likeDoc.exists);

            if (likeDoc.exists) {
                console.log("Deleting like");
                transaction.delete(likeRef);
                transaction.update(postRef, { likesCount: admin.firestore.FieldValue.increment(-1) });
            } else {
                console.log("Setting like");
                transaction.set(likeRef, { userId, createdAt: admin.firestore.FieldValue.serverTimestamp() });
                console.log("Updating post counts");
                transaction.update(postRef, { likesCount: admin.firestore.FieldValue.increment(1) });
            }
            console.log("Transaction Body End");
        });

        console.log("SUCCESS");
        process.exit(0);
    } catch (error: any) {
        console.log("ERROR_TYPE:", typeof error);
        console.log("ERROR_MESSAGE:", error.message);
        console.log("ERROR_STACK:", error.stack);
        process.exit(1);
    }
}

testToggleLike();
