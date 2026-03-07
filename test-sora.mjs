import https from 'https';

const options = {
    hostname: 'api.openai.com',
    path: '/v1/videos',
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY
    }
};

const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const parsed = JSON.parse(data);
            console.log(JSON.stringify(parsed, null, 2));
        } catch (e) { console.log(data); }
    });
});
req.end();
