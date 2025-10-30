exports.handler = async function(event) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      news: [
        {
          id: '1',
          team: 'japan',
          teamName: 'National Team',
          title: 'Test News 1',
          date: '2025-10-30',
          source: 'Test',
          url: 'https://example.com',
          excerpt: 'Test excerpt'
        }
      ],
      status: 'success'
    })
  };
};
