import { createServer } from 'http';
import { handler as generateHandler } from './dist/handlers/generate.js';
import { handler as getStylesHandler } from './dist/handlers/getStyles.js';

const PORT = 3000;

const server = createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  try {
    // Route: GET /api/styles
    if (req.url === '/api/styles' && req.method === 'GET') {
      const result = await getStylesHandler({}, {});
      res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
      res.end(result.body);
      return;
    }

    // Route: POST /api/generate
    if (req.url === '/api/generate' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        const event = { body };
        const result = await generateHandler(event, {});
        res.writeHead(result.statusCode, { 'Content-Type': 'application/json' });
        res.end(result.body);
      });
      return;
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(PORT, () => {
  console.log(`\n🚀 Local server running at http://localhost:${PORT}`);
  console.log(`   GET  http://localhost:${PORT}/api/styles`);
  console.log(`   POST http://localhost:${PORT}/api/generate\n`);
});
