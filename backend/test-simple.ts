import { db } from './src/config/firebase';

async function testSimple() {
    try {
        console.log("Fetching a doc...");
        const doc = await db.collection('posts').doc('1HgFhC7zSYr8PHxMbreO').get();
        if (doc.exists) {
            console.log("Doc exists:", doc.data());
        } else {
            console.log("Doc does not exist");
        }
        process.exit(0);
    } catch (error) {
        console.error("Simple check failed:", error);
        process.exit(1);
    }
}

testSimple();
