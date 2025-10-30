exports.handler = async function(event, context) {
const headers = {
‘Access-Control-Allow-Origin’: ‘*’,
‘Access-Control-Allow-Headers’: ‘Content-Type’,
‘Content-Type’: ‘application/json’
};

if (event.httpMethod === ‘OPTIONS’) {
return {
statusCode: 200,
headers: headers,
body: ‘’
};
}

const testNews = [
{
id: ‘test-1’,
team: ‘japan’,
teamName: ‘日本代表’,
title: ‘テストニュース1’,
date: ‘2025-10-30’,
source: ‘テスト’,
url: ‘https://www.japanbasketball.jp/’,
excerpt: ‘これはテスト用のニュースです。’
},
{
id: ‘test-2’,
team: ‘chiba’,
teamName: ‘千葉ジェッツ’,
title: ‘テストニュース2’,
date: ‘2025-10-29’,
source: ‘テスト’,
url: ‘https://chibajets.jp/’,
excerpt: ‘これもテスト用のニュースです。’
},
{
id: ‘test-3’,
team: ‘alvark’,
teamName: ‘アルバルク東京’,
title: ‘テストニュース3’,
date: ‘2025-10-28’,
source: ‘テスト’,
url: ‘https://www.alvark-tokyo.jp/’,
excerpt: ‘アルバルク東京のテストニュースです。’
}
];

return {
statusCode: 200,
headers: headers,
body: JSON.stringify({
news: testNews,
lastUpdated: new Date().toISOString(),
count: testNews.length,
status: ‘success’
})
};
};