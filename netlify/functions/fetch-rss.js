const Parser = require(‘rss-parser’);
const parser = new Parser({
timeout: 8000,
headers: {
‘User-Agent’: ‘Mozilla/5.0 (compatible; BLeagueNews/1.0)’
}
});

const RSS_FEEDS = [
{
id: ‘japan’,
name: ‘バスケ日本代表’,
url: ‘https://www.japanbasketball.jp/feed/’,
team: ‘japan’
},
{
id: ‘bleague’,
name: ‘Bリーグ公式’,
url: ‘https://www.bleague.jp/feed/’,
team: ‘bleague’
},
{
id: ‘alvark’,
name: ‘アルバルク東京’,
url: ‘https://www.alvark-tokyo.jp/feed/’,
team: ‘alvark’
},
{
id: ‘levanga’,
name: ‘レバンガ北海道’,
url: ‘https://levanga.com/feed/’,
team: ‘levanga’
},
{
id: ‘akita’,
name: ‘秋田ノーザンハピネッツ’,
url: ‘https://www.northern-happinets.com/feed/’,
team: ‘akita’
},
{
id: ‘sendai’,
name: ‘仙台89ERS’,
url: ‘https://www.89ers.jp/feed/’,
team: ‘sendai’
},
{
id: ‘gunma’,
name: ‘群馬クレインサンダーズ’,
url: ‘https://gunma-cranesports.com/feed/’,
team: ‘gunma’
},
{
id: ‘utsunomiya’,
name: ‘宇都宮ブレックス’,
url: ‘https://www.brex.jp/feed/’,
team: ‘utsunomiya’
},
{
id: ‘chiba’,
name: ‘千葉ジェッツ’,
url: ‘https://chibajets.jp/feed/’,
team: ‘chiba’
},
{
id: ‘kawasaki’,
name: ‘川崎ブレイブサンダース’,
url: ‘https://www.kawasaki-brave-thunders.com/feed/’,
team: ‘kawasaki’
},
{
id: ‘yokohama’,
name: ‘横浜ビー・コルセアーズ’,
url: ‘https://www.b-corsairs.com/feed/’,
team: ‘yokohama’
},
{
id: ‘niigata’,
name: ‘新潟アルビレックスBB’,
url: ‘https://www.albirex.com/basketball/feed/’,
team: ‘niigata’
},
{
id: ‘toyama’,
name: ‘富山グラウジーズ’,
url: ‘https://www.grouses.jp/feed/’,
team: ‘toyama’
},
{
id: ‘sunrockers’,
name: ‘サンロッカーズ渋谷’,
url: ‘https://www.sunrockers.org/feed/’,
team: ‘sunrockers’
},
{
id: ‘nagoya’,
name: ‘名古屋ダイヤモンドドルフィンズ’,
url: ‘https://www.nagoya-dolphins.jp/feed/’,
team: ‘nagoya’
},
{
id: ‘seahorses’,
name: ‘シーホース三河’,
url: ‘https://www.seahorses-mikawa.com/feed/’,
team: ‘seahorses’
},
{
id: ‘shiga’,
name: ‘滋賀レイクス’,
url: ‘https://www.lakestars.net/feed/’,
team: ‘shiga’
},
{
id: ‘kyoto’,
name: ‘京都ハンナリーズ’,
url: ‘https://hannaryz.com/feed/’,
team: ‘kyoto’
},
{
id: ‘osaka’,
name: ‘大阪エヴェッサ’,
url: ‘https://evessa.com/feed/’,
team: ‘osaka’
},
{
id: ‘shimane’,
name: ‘島根スサノオマジック’,
url: ‘https://www.susanoo-m.com/feed/’,
team: ‘shimane’
},
{
id: ‘hiroshima’,
name: ‘広島ドラゴンフライズ’,
url: ‘https://www.hiroshima-dragonflies.com/feed/’,
team: ‘hiroshima’
},
{
id: ‘ryukyu’,
name: ‘琉球ゴールデンキングス’,
url: ‘https://goldenkings.jp/feed/’,
team: ‘ryukyu’
}
];

async function fetchSingleFeed(feed) {
try {
console.log(‘Fetching:’, feed.name);
const result = await parser.parseURL(feed.url);

```
if (!result || !result.items || result.items.length === 0) {
  console.log('No items for:', feed.name);
  return [];
}

const newsItems = result.items.slice(0, 10).map((item, index) => {
  let dateStr = new Date().toISOString().split('T')[0];
  
  if (item.pubDate) {
    try {
      const d = new Date(item.pubDate);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().split('T')[0];
      }
    } catch (e) {
      console.error('Date parse error:', e);
    }
  }

  let excerpt = '';
  const content = item.contentSnippet || item.content || item.description || '';
  if (content) {
    excerpt = content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 150);
    
    if (excerpt.length >= 150) {
      excerpt += '...';
    }
  }

  if (!excerpt) {
    excerpt = 'ニュースの詳細は元記事をご確認ください';
  }

  return {
    id: feed.id + '-' + index + '-' + Date.now(),
    team: feed.team,
    teamName: feed.name,
    title: (item.title || 'タイトルなし').trim(),
    date: dateStr,
    source: feed.name + '公式',
    url: item.link || '#',
    excerpt: excerpt
  };
});

console.log('Success:', feed.name, newsItems.length, 'items');
return newsItems;
```

} catch (error) {
console.error(‘Error fetching’, feed.name + ‘:’, error.message);
return [];
}
}

exports.handler = async function(event) {
const headers = {
‘Content-Type’: ‘application/json’,
‘Access-Control-Allow-Origin’: ‘*’,
‘Access-Control-Allow-Headers’: ‘Content-Type’,
‘Cache-Control’: ‘public, max-age=300’
};

if (event.httpMethod === ‘OPTIONS’) {
return { statusCode: 200, headers, body: ‘’ };
}

try {
console.log(’=== Starting RSS fetch ===’);
console.log(‘Time:’, new Date().toISOString());
console.log(‘Feeds to fetch:’, RSS_FEEDS.length);

```
const allNews = [];

for (const feed of RSS_FEEDS) {
  const newsItems = await fetchSingleFeed(feed);
  if (newsItems && newsItems.length > 0) {
    allNews.push(...newsItems);
  }
  await new Promise(resolve => setTimeout(resolve, 100));
}

console.log('Total news collected:', allNews.length);

allNews.sort((a, b) => {
  try {
    return new Date(b.date) - new Date(a.date);
  } catch (e) {
    return 0;
  }
});

console.log('=== Fetch complete ===');

return {
  statusCode: 200,
  headers,
  body: JSON.stringify({
    news: allNews,
    lastUpdated: new Date().toISOString(),
    count: allNews.length,
    status: 'success'
  })
};
```

} catch (error) {
console.error(’=== Handler error ===’);
console.error(error);

```
return {
  statusCode: 200,
  headers,
  body: JSON.stringify({
    news: [],
    error: error.message,
    lastUpdated: new Date().toISOString(),
    count: 0,
    status: 'error'
  })
};
```

}
};