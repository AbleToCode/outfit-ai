import express from 'express';
import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';
import { loadEnv } from 'vite';

const env = process.env.NODE_ENV !== 'production' ? loadEnv('development', '.', '') : process.env;
process.env.DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || env.DASHSCOPE_API_KEY;

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

app.use(express.json({ limit: '10mb' }));

// API proxy endpoint
app.post('/api/analyze', async (req, res) => {
  const { image, prompt } = req.body;

  try {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');

    const response = await client.chat.completions.create({
      model: 'qwen3-vl-235b-a22b-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64Data}` },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response content received from service.');
    }

    res.json({ result: JSON.parse(content) });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ error: '分析失败，请重试。' });
  }
});

// Vite dev server
if (process.env.NODE_ENV !== 'production') {
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Serve static files from dist
  app.use(express.static(join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
