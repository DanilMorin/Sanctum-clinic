import 'dotenv/config';
import express from 'express';

const app = express();

const port = Number(process.env.API_PORT || 3000);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'sanctum-clinic',
  });
});

app.listen(port, () => {
  console.log(`API server started on port ${port}`);
});