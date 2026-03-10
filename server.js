const express = require('express');
const dotenv = require('dotenv');
dotenv.config(); // Memuat environment variables dari file .env

const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk parsing JSON body
app.use(express.json());

// Mount endpoints
app.post('/api/trigger', require('./api/trigger'));
app.post('/api/callback', require('./api/callback'));
app.get('/api/result', require('./api/result'));

// Root endpoint (optional)
app.get('/', (req, res) => {
  res.send('Server reseller bot berjalan!');
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

export default app;
