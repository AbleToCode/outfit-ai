# 快速部署指南（控制台手动部署）

## 第一步：开通阿里云服务

### 1.1 开通函数计算 FC
1. 访问：https://fc-next.console.aliyun.com/
2. 首次使用会提示开通，点击"立即开通"
3. 按提示完成授权（免费开通）

### 1.2 开通对象存储 OSS
1. 访问：https://oss.console.aliyun.com/
2. 点击"开通 OSS 服务"
3. 完成开通流程

---

## 第二步：创建函数计算 FC（API 代理）

### 2.1 创建服务
1. 在 FC 控制台，点击"创建服务"
2. 服务名称：`outfit-api`
3. 地域：选择**华东 1（杭州）**或离你最近的区域
4. 点击"确定"

### 2.2 创建函数
1. 进入刚创建的服务 `outfit-api`
2. 点击"创建函数"
3. 选择"**事件函数**"
4. 运行环境：**Node.js 18**
5. 函数名称：`outfit-analyze`
6. 代码上传方式：**上传 ZIP 包**

### 2.3 准备代码包
在本地创建 `fc-function.zip`，包含以下文件：

**index.js:**
```javascript
const OpenAI = require('openai');

exports.handler = async (event, context) => {
  const client = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  });

  try {
    const body = JSON.parse(event.body);
    const image = body.image;
    const prompt = body.prompt;
    
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
```

**package.json:**
```json
{
  "name": "outfit-api-proxy",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "openai": "^4.28.0"
  }
}
```

### 2.4 上传代码包
1. 将 `index.js` 和 `package.json` 打包成 `fc-function.zip`
2. 在 FC 控制台上传此 ZIP 包
3. 点击"下一步"

### 2.5 配置环境变量
1. 环境变量区域，点击"添加环境变量"
2. 变量名：`DASHSCOPE_API_KEY`
3. 变量值：`sk-36f3fe3e7d60407482f9e538978916a0`
4. 点击"完成"

### 2.6 配置触发器
1. 创建函数后，进入函数详情页
2. 点击"触发器" → "创建触发器"
3. 触发器类型：选择 **HTTP**
4. 认证方式：选择 **无**（或 API 密钥）
5. 请求方法：选择 **POST**
6. 点击"确定"

### 2.7 获取 API 地址
1. 触发器创建完成后，复制触发器 URL
2. 格式类似：`https://fc-xxx.cn-hangzhou.fc.aliyuncs.com/2016-08-15/proxy/outfit-api/outfit-analyze/`
3. **保存此 URL**，下一步需要

---

## 第三步：创建 OSS Bucket

### 3.1 创建 Bucket
1. 在 OSS 控制台，点击"创建 Bucket"
2. Bucket 名称：`outfit-app-xxx`（需要全局唯一，加随机数）
3. 地域：选择与 FC**相同**的区域（如华东 1）
4. 读写权限：选择**公共读**
5. 点击"确定"

### 3.2 上传文件
1. 进入刚创建的 Bucket
2. 点击"文件管理" → "上传文件"
3. 上传 `dist` 目录下的**所有文件和文件夹**：
   - `index.html`
   - `assets/` 文件夹
4. 上传完成后，确认文件列表

### 3.3 测试访问
1. 在 Bucket 概览页，找到"访问域名"
2. 格式：`http://outfit-app-xxx.oss-cn-hangzhou.aliyuncs.com`
3. 在浏览器打开此链接，应该能看到你的应用

---

## 第四步：配置 CDN（可选，加速访问）

### 4.1 添加 CDN 域名
1. 访问：https://cdn.console.aliyun.com/
2. 点击"添加域名"
3. 域名类型：**加速域名**
4. 加速区域：**仅中国内地**
5. 业务类型：**图片小文件**
6. 源站类型：**OSS 域名**
7. 源站地址：选择你的 Bucket
8. 点击"下一步"

### 4.2 等待生效
- CDN 配置通常需要 5-10 分钟生效
- 生效后可以使用 CDN 域名访问

---

## 第五步：验证部署

### 测试清单
- [ ] OSS 域名可以访问首页
- [ ] 上传穿搭照片
- [ ] 获取 AI 分析结果
- [ ] 评分和建议显示正常

### 常见问题排查

**问题 1: OSS 访问 403**
- 检查 Bucket 权限是否为"公共读"
- OSS 控制台 → Bucket → 权限管理 → 读写权限

**问题 2: API 调用失败**
- 检查 FC 函数日志：FC 控制台 → 函数 → 日志查询
- 确认环境变量 `DASHSCOPE_API_KEY` 正确
- 检查触发器 URL 是否正确

**问题 3: 跨域错误**
- FC 函数代码已包含 CORS headers
- 清除浏览器缓存后重试

---

## 部署完成后的地址

- **OSS 地址**: `http://<bucket-name>.oss-<region>.aliyuncs.com`
- **CDN 地址**: （如果配置了 CDN）`http://<cdn-domain>`
- **API 地址**: `https://<fc-trigger-url>`

---

## 成本估算

| 服务 | 免费额度 | 预估月成本 |
|------|----------|------------|
| OSS 存储 | - | ¥1-2 |
| OSS 请求 | - | ¥0.5 |
| CDN 流量 | 5GB/月 | ¥1-5 |
| 函数计算 | 100 万次/月 | ¥0-2 |

**总计：约 ¥3-10/月**（个人使用）

---

## 下一步优化

1. **绑定自定义域名**（需要备案）
2. **HTTPS 配置**（CDN 控制台申请免费 SSL）
3. **访问统计**（接入百度统计等）
4. **错误监控**（接入 Sentry）
