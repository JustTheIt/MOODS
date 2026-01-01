
async function checkServer() {
    try {
        console.log('Fetching feed from http://localhost:5000/api/posts/feed...');
        const res = await fetch('http://localhost:5000/api/posts/feed');
        if (!res.ok) {
            console.error(`❌ Server returned ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error('Body:', text);
            process.exit(1);
        }
        const data: any = await res.json();
        console.log('✅ Success! Feed data received.');
        console.log('Post count:', data.posts?.length);
    } catch (error) {
        console.error('❌ Request failed:', error);
    }
}

checkServer();
