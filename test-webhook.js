// Test script for n8n webhook
const testWebhook = async () => {
    const webhookUrl = 'https://bitlanceai.app.n8n.cloud/webhook/82a8081c-0484-4d1b-9ad4-03194a2eb145/webhook';

    const testData = {
        content: 'Test doubt: How do I prepare for system design interviews?',
        user_name: 'Test Student',
        user_id: 'test-123',
        tags: ['System Design', 'Interview Prep'],
        created_at: new Date().toISOString(),
        status: 'open'
    };

    console.log('🔄 Testing webhook...');
    console.log('URL:', webhookUrl);
    console.log('Data:', JSON.stringify(testData, null, 2));
    console.log('\n---\n');

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testData)
        });

        console.log('✅ Response Status:', response.status, response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log('\n📦 Response Body:');

        try {
            const jsonResponse = JSON.parse(responseText);
            console.log(JSON.stringify(jsonResponse, null, 2));
        } catch {
            console.log(responseText);
        }

        if (response.ok) {
            console.log('\n✅ Webhook test PASSED!');
        } else {
            console.log('\n❌ Webhook test FAILED!');
        }

    } catch (error) {
        console.error('❌ Error testing webhook:', error.message);
        console.error('Details:', error);
    }
};

testWebhook();
