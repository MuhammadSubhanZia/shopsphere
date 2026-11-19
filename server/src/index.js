// Temporary entry point: proves that the server starts.
// It is replaced by the real one (database + app factory) in the next commit.
import 'dotenv/config';
import express from 'express';

const app = express();
const port = process.env.PORT || 5000;

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`ShopSphere API listening on http://localhost:${port}`);
});
