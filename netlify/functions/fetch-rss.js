const Parser = require('rss-parser');
const parser = new Parser();

exports.handler = async function(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const feeds = [
      { id: 'bleague', name: 'B.LEAGUE', url: 'https://www.bleague.jp/feed/', team: 'bleague' }
    ];

    const allNews = [];

    for (const feed of feeds) {
      try {
        const result = await parser.parseURL(feed.url);
        const items = result.items.slice(0, 10).map((item, i) => ({
          id: feed.id + '-' + i,
          team: feed.team,
          teamName: feed.name,
          title: item.title || 'No title',
          date: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : '2025-10-30',
          source: feed.name,
          url: item.link || '#',
          excerpt: (item.contentSnippet || '').substring(0, 100)
        }));
        allNews.push(...items);
      } catch (e) {
        console.error('Feed error:', e);
      }
    }

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
  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        news: [],
        error: error.message,
        status: 'error'
      })
    };
  }
};
