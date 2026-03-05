import fetch from 'node-fetch';

async function checkData() {
    try {
        const res = await fetch('http://localhost:3000/api/articles');
        const data = await res.json();
        const first = data[0];
        console.log('--- ARTICLE 0 ---');
        console.log('ID:', first.id);
        console.log('TITLE:', first.title);
        console.log('IMAGE:', first.imageUrl);
        console.log('CONTENT TYPE:', typeof first.content);
        console.log('CONTENT IS ARRAY:', Array.isArray(first.content));
        if (Array.isArray(first.content)) {
            console.log('CONTENT LENGTH:', first.content.length);
            console.log('CONTENT[0]:', first.content[0]);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkData();
