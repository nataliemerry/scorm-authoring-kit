const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

module.exports = function localServer(root, fixtures = {}) {
  return http.createServer((req, res) => {
    const url = decodeURIComponent(req.url.split('?')[0]);
    if (fixtures[url]) {
      res.setHeader('Content-Type', 'text/html');
      res.end(fixtures[url]());
      return;
    }
    const file = path.resolve(root, '.' + url);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404).end();
      return;
    }
    const total = fs.statSync(file).size;
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
      '.mp4': 'video/mp4', '.png': 'image/png', '.webp': 'image/webp' };
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    const range = req.headers.range?.match(/bytes=(\d+)-(\d*)/);
    const start = range ? Number(range[1]) : 0;
    const end = range?.[2] ? Math.min(Number(range[2]), total - 1) : total - 1;
    if (start > end || start >= total) { res.writeHead(416).end(); return; }
    if (range) {
      res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes', 'Content-Length': end - start + 1 });
    } else res.setHeader('Content-Length', total);
    const stream = fs.createReadStream(file, { start, end });
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  });
};
