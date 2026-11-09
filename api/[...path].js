import app from '../server/src/server.js';

// Vercel Node Function: the Express app handles /api/* routes.
// MongoDB connection is initialized lazily and reused by warm instances.
export default app;
