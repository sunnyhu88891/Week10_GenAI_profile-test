const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// 여기 있는 확장자만 제공하므로 server.js, package.json 등은 노출되지 않는다.
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return send(res, 405, 'Method Not Allowed');
  }

  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    const relativePath = pathname === '/' ? 'index.html' : '.' + decodeURIComponent(pathname);
    const filePath = path.resolve(ROOT, relativePath);
    const type = MIME_TYPES[path.extname(filePath).toLowerCase()];

    // 프로젝트 폴더 바깥의 파일 요청은 차단한다.
    if (!filePath.startsWith(ROOT + path.sep) || !type) {
      return send(res, 404, 'Not Found');
    }

    send(res, 200, await fs.readFile(filePath), type);
  } catch {
    send(res, 404, 'Not Found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`http://localhost:${PORT} 에서 실행 중입니다. 종료하려면 Ctrl+C를 누르세요.`);
});
