const https = require('https');

const testData = JSON.stringify({
    content: 'Test doubt: How do I prepare for system design interviews?',
    user_name: 'Test Student',
    user_id: 'test-123',
    tags: ['System Design', 'Interview Prep'],
    created_at: new Date().toISOString(),
    status: 'open'
});

const options = {
    hostname: 'bitlanceai.app.n8n.cloud',
    path: '/webhook-test/new-doubt',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
    }
};

console.log('Testing webhook: https://bitlanceai.app.n8n.cloud/webhook-test/new-doubt\n');

const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}\n`);

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:');
        console.log(data);
        console.log('\n' + (res.statusCode === 200 ? '✅ SUCCESS' : '❌ FAILED'));
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

req.write(testData);
req.end();
