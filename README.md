<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Outfit - 你的私人时尚顾问

<div align="center">
<img width="1200" height="475" alt="Outfit Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## 功能特性

- 📸 上传穿搭照片，获取专业评分
- 🎯 严格但建设性的时尚建议
- 🎨 自动提取配色方案
- 🔒 API Key 安全保护（后端代理层）

## 本地开发

**前置条件:** Node.js 18+

1. 安装依赖:
   ```bash
   npm install
   ```

2. 配置环境变量:
   ```bash
   # 复制 .env.local 并填写你的阿里云百炼 API Key
   DASHSCOPE_API_KEY=sk-your-api-key
   ```

3. 启动开发服务器:
   ```bash
   npm run dev
   ```

访问 http://localhost:3000

## 部署

详细部署指南请查看 [DEPLOYMENT.md](DEPLOYMENT.md)

### 快速部署到阿里云

```bash
# 1. 部署 API 代理到函数计算 FC
cd api-proxy
fun deploy

# 2. 构建前端
npm run build

# 3. 上传到 OSS
ossutil cp -r dist oss://your-bucket/
```

## 技术栈

- **前端:** React 19 + TypeScript + Vite
- **UI:** Tailwind CSS + Lucide Icons
- **AI:** Qwen3-VL (阿里云百炼)
- **部署:** 阿里云 OSS + CDN + 函数计算 FC
