# 部署说明

## 当前状态

### 本地访问链接
- **本地开发服务器**: `http://localhost:3000`
- **JD匹配功能页面**: `http://localhost:3000/jd-match`

## 部署到线上（推荐用于提交作业）

### 方案一：Vercel 部署（推荐，免费且简单）

1. **准备工作**
   - 确保项目已提交到 Git（GitHub/GitLab/Bitbucket）
   - 如果没有 Git 仓库，先初始化：
     ```bash
     git init
     git add .
     git commit -m "Initial commit"
     ```

2. **部署步骤**
   - 访问 [Vercel](https://vercel.com)
   - 使用 GitHub/GitLab/Bitbucket 账号登录
   - 点击 "New Project"
   - 导入你的 Git 仓库
   - Vercel 会自动检测 Next.js 项目并配置
   - 点击 "Deploy" 等待部署完成
   - 部署完成后会得到一个公开的 URL，例如：`https://your-project.vercel.app`

3. **环境变量（如果需要）**
   - 如果后续需要添加 API Key 等，在 Vercel 项目设置中添加环境变量

### 方案二：Netlify 部署

1. 访问 [Netlify](https://www.netlify.com)
2. 连接 Git 仓库
3. 构建设置：
   - Build command: `npm run build`
   - Publish directory: `.next`
4. 部署

### 方案三：其他平台
- Railway
- Render
- AWS Amplify

## 本地运行（用于测试）

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问
http://localhost:3000/jd-match
```

## 功能说明

### 已实现的功能
✅ JD匹配度分析页面
✅ 简历文本输入
✅ PDF/DOCX文件上传
✅ 匹配度分析报告
✅ 天蓝色主题UI

### 主要页面链接
- 首页: `/`
- JD匹配页面: `/jd-match`
- 匹配报告: `/jd-match/report`

## 技术栈
- **框架**: Next.js 14 (基于 React 18)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **文件解析**: pdf-parse, mammoth

