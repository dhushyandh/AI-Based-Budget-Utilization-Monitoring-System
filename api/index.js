import app from '../server/src/server.js';

// Vercel rewrites /api/* requests to this function and passes the
// original route in ?path=. Restore it before handing the request to Express.
export default function handler(req, res) {
  const path = Array.isArray(req.query?.path) ? req.query.path.join('/') : String(req.query?.path || '');
  if (path) req.url = '/api/' + path + (req.url?.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : '');
  else req.url = '/api' + (req.url?.includes('?') ? '?' + req.url.split('?').slice(1).join('?') : '');
  return app(req, res);
}
