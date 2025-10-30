const Parser = require('rss-parser');
const parser = new Parser({
  timeout: 8000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; BLeagueNews/1.0)'
  }
});

const RSS_FEEDS = [
  {
    id: 'japan',
    name: 'バスケ日本代表',
    url: 'https://www.japanbasketball.jp/feed/',
    team: 'japan'
  },
  {
    id: 'bleague',
    name: 'Bリーグ公式',
    url: 'https://www.bleague.jp/files/topics/rss/group7.rdf',
    team: 'bleague'
  }
];

async function fetchSingleFeed(feed) {
  try {
    console.log('Fetching:', feed.name);
    const result = await parser.parseURL(feed.url);
    
    if (!result || !result.items || result.items.length === 0) {
      console.log('No items for:', feed.name);
      return [];
    }

    const newsItems = result.items.slice(0, 20).map((item, index) => {
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
      } else if (item.isoDate) {
        try {
          const d = new Date(item.isoDate);
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
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
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

  } catch (error) {
    console.error('Error fetching', feed.name + ':', error.message);
    return [];
  }
}

exports.handler = async function(event) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'public, max-age=300'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    console.log('=== Starting RSS fetch ===');
    console.log('Time:', new Date().toISOString());
    console.log('Feeds to fetch:', RSS_FEEDS.length);

    const allNews = [];
    
    for (const feed of RSS_FEEDS) {
      const newsItems = await fetchSingleFeed(feed);
      if (newsItems && newsItems.length > 0) {
        allNews.push(...newsItems);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
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

  } catch (error) {
    console.error('=== Handler error ===');
    console.error(error);

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
  }
};