import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import OpenAI from 'openai';

let localEnv = {};
if (process.env.NODE_ENV !== 'production') {
  try {
    const { loadEnv } = await import('vite');
    localEnv = loadEnv('development', '.', '');
  } catch (e) {
    console.warn('Vite not found, skipping local env load');
  }
}

process.env.DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY || localEnv.DASHSCOPE_API_KEY;

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

const client = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

app.use(express.json({ limit: '10mb' }));

// API proxy endpoint
app.post('/api/analyze', async (req, res) => {
  if (!process.env.DASHSCOPE_API_KEY) {
    return res.status(500).json({ error: '服务端未配置 DASHSCOPE_API_KEY (API 密钥缺失)，请在部署平台添加此环境变量。' });
  }

  const { image, prompt } = req.body;

  if (!image) {
    return res.status(400).json({ error: '未提供图片数据。' });
  }

  try {
    // Attempt to extract MIME type and Base64 data
    const matches = image.match(/^data:(image\/\w+);base64,(.*)$/);
    let mimeType = 'image/jpeg';
    let base64Data = image;

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      base64Data = matches[2];
    } else {
      base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    }

    const response = await client.chat.completions.create({
      model: 'qwen-vl-max', // Fallback to a generally available vision model if the instructed one isn't working
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Data}` },
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
      throw new Error('未从 AI 模型获取到分析结果。');
    }

    res.json({ result: JSON.parse(content) });
  } catch (error) {
    console.error('Analysis Error:', error);
    const errorMessage = error.message || '未知错误';
    res.status(500).json({ error: `分析失败: ${errorMessage}` });
  }
});

// Vite dev server
if (process.env.NODE_ENV !== 'production') {
  try {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } catch (e) {
    console.warn('Vite not found, skipping dev server');
  }
} else {
  // Serve static files from dist
  app.use(express.static(join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
