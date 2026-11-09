// Keep this Vercel entrypoint CommonJS-compatible. The Express application
// is an ES module, so load it with dynamic import at invocation time.
let appPromise;

module.exports = async function handler(req, res) {
  try {
    appPromise ||= import('../server/src/server.js').then((module) => module.default);

    const app = await appPromise;
    const path = Array.isArray(req.query?.path)
      ? req.query.path.join('/')
      : String(req.query?.path || '');

    const queryString = req.url?.includes('?')
      ? '?' + req.url.split('?').slice(1).join('?')
      : '';

    req.url = (path ? '/api/' + path : '/api') + queryString;
    return app(req, res);
  } catch (error) {
    console.error('Failed to initialize Budget Utilization API:', error);
    if (!res.headersSent) {
      return res.status(500).json({
        status: 'error',
        message: 'API initialization failed'
      });
    }
  }
};
