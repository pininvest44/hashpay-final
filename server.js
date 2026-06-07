
import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const delay = ms => new Promise(r => setTimeout(r, ms));

app.post('/api/bulk-stk', async (req, res) => {
  const { numbers, amount, reference } = req.body;
  const results = [];

  for (const phone of numbers) {
    try {
      const response = await axios.post(
        'https://api.hashback.co.ke/initiatestk',
        {
          api_key: process.env.API_KEY,
          account_id: process.env.ACCOUNT_ID,
          amount,
          msisdn: phone,
          reference
        }
      );

      results.push({ phone, success: true, data: response.data });
    } catch (err) {
      results.push({
        phone,
        success: false,
        error: err.response?.data || err.message
      });
    }

    await delay(2000);
  }

  res.json({ total: results.length, results });
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
