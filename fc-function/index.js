const OpenAI = require('openai');

exports.handler = async (event, context) => {
  const client = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  });

  try {
    const { image, prompt } = JSON.parse(event.body);
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

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ result: JSON.parse(content) }),
    };
  } catch (error) {
    console.error('Analysis Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: '分析失败，请重试。' }),
    };
  }
};
