# 部署指南

## 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量
# 复制 .env.local 并填写：
# - DASHSCOPE_API_KEY: 阿里云百炼 API Key
# - VITE_API_PROXY_URL: 本地开发时留空或填 http://localhost:3000/api/analyze

# 3. 启动开发服务器
npm run dev
```

访问：http://localhost:3000

---

## 部署到阿里云 OSS + CDN

### 第一步：部署 API 代理到函数计算 FC

1. **开通阿里云函数计算 FC**
   - 访问 https://fc.console.aliyun.com
   - 开通服务（首次使用需要授权）

2. **安装 Funcraft 工具**
   ```bash
   # macOS
   brew install aliyun-cli
   
   # Windows (PowerShell)
   winget install Alibaba.AliyunCLI
   
   # 配置 credentials
   aliyun configure
   ```

3. **部署 API 代理**
   ```bash
   cd api-proxy
   
   # 编辑 template.yml，将 ${DASHSCOPE_API_KEY} 替换为你的实际 API Key
   
   # 部署
   fun deploy
   ```

4. **获取 API 地址**
   - 部署完成后，Funcraft 会输出 API 地址
   - 格式：`https://<service>-<function>.<region>.fc.aliyuncs.com/2016-08-15/proxy/outfit-api/outfit-analyze/`
   - 保存此地址

---

### 第二步：构建并部署前端

1. **更新环境变量**
   ```bash
   # 创建 .env.production
   VITE_API_PROXY_URL=https://<你的 FC 函数地址>
   ```

2. **构建前端**
   ```bash
   npm run build
   ```

3. **创建 OSS Bucket**
   - 访问 https://oss.console.aliyun.com
   - 创建 Bucket（建议选"华东 1"或"华东 2"）
   - 权限设置：**公共读**
   - 读写权限：ACL → 公共读

4. **上传文件**
   ```bash
   # 使用 ossutil 工具
   # 或使用 OSS 控制台直接上传 dist 目录所有文件
   
   # 方式 1: 控制台上传
   # - 进入 Bucket → 文件管理 → 上传文件
   # - 上传 dist 目录下所有文件（包括子目录）
   
   # 方式 2: ossutil 命令行
   ossutil cp -r dist oss://<your-bucket-name>/
   ```

---

### 第三步：配置 CDN

1. **开通 CDN**
   - 访问 https://cdn.console.aliyun.com
   - 点击"添加域名"

2. **配置域名**
   - 域名类型：加速域名
   - 加速区域：仅中国内地（或全球）
   - 业务类型：图片小文件
   - 源站类型：OSS 域名
   - 源站地址：选择刚才创建的 Bucket

3. **配置 HTTPS**（可选）
   - CDN 域名列表 → 选择域名 → HTTPS 配置
   - 上传证书或使用免费 SSL

4. **CNAME 配置**
   - CDN 会提供一个 CNAME 地址
   - 如果有自己的域名，需要在 DNS 服务商处配置 CNAME

---

### 第四步：验证部署

1. **访问 CDN 地址**
   - 使用阿里云提供的默认 CDN 域名访问
   - 格式：`http://<bucket-name>.<region>.oss-<region>.aliyuncs.com`

2. **测试 API 调用**
   - 打开网页
   - 上传一张穿搭照片
   - 检查是否能正常获取分析结果

---

## 成本估算

| 服务 | 免费额度 | 超出后价格 |
|------|----------|------------|
| OSS 存储 | - | ¥0.12/GB/月 |
| OSS 请求 | - | ¥0.01/万次 |
| CDN 流量 | 每月 5GB | ¥0.24/GB |
| 函数计算 | 每月 100 万调用 | ¥0.0125/万次 |

**预估月成本：** < ¥10（个人使用）

---

## 常见问题

### 1. API 调用失败
- 检查 FC 函数日志：FC 控制台 → 函数 → 日志
- 确认 API Key 正确
- 检查 CORS 配置

### 2. 页面加载慢
- 确认 CDN 已生效（通常 5-10 分钟）
- 检查 OSS Bucket 权限是否为"公共读"

### 3. 跨域错误
- FC 函数已配置 CORS headers
- 如仍有问题，检查 CDN 是否缓存了旧版本

---

## 后续优化

1. **添加域名**：备案后绑定自定义域名
2. **访问控制**：OSS 设为私有，通过 CDN 鉴权访问
3. **性能优化**：开启 CDN 智能压缩、浏览器缓存
4. **监控告警**：配置云监控，设置费用告警
