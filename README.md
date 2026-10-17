# Arabic Quest · 阿拉伯语冒险学院（第一版）

这是一个响应式网页原型，包含四个学习等级、可实际游玩的词汇挑战、经验值/进度保存，以及真实 AI 对话与句子纠错接口。

## 你可以先体验什么
- 冒险大厅、学习地图、趣味挑战、AI 对话、我的成长
- 入门 / 初学 / 中级 / 高级四个学习等级
- 每轮 5 道词汇题、答题反馈、经验奖励
- 学习进度保存在当前浏览器的 localStorage
- AI 对话会按等级调整回复，并要求模型分析错误、给出修正和解释

## 启动方式（Mac / Windows）
需要安装 Node.js 18 或更新版本。

1. 解压项目文件夹。
2. 在该文件夹中打开终端（Windows 可在文件夹地址栏输入 `cmd`；Mac 可用终端进入该目录）。
3. 复制环境配置模板：
   - Mac / Linux：`cp .env.example .env`
   - Windows PowerShell：`Copy-Item .env.example .env`
4. 打开 `.env`，填入你自己的 AI 服务密钥和模型：
   ```
   OPENAI_API_KEY=在这里填写你的密钥
   OPENAI_BASE_URL=https://api.openai.com/v1
   OPENAI_MODEL=gpt-4.1-mini
   PORT=3000
   ```
   不要把真实密钥发给别人，也不要放进 `index.html`。
5. 安装并启动：
   ```
   npm start
   ```
6. 浏览器打开 `http://localhost:3000`。

## 费用与模型说明
- “真实 AI 自由对话”必须由可访问的模型服务提供。此项目不会内置 API 密钥，也不会声称未配置时已经连上 AI。
- API 服务可能按用量收费；请先查看你所选服务的价格与可用地区。
- `OPENAI_BASE_URL` 和 `OPENAI_MODEL` 可以设置为兼容 OpenAI Chat Completions API 的服务。不同服务的兼容程度可能不同。
- 如果使用 Ollama 等本地兼容服务，可以尝试：
  ```
  OPENAI_API_KEY=ollama
  OPENAI_BASE_URL=http://127.0.0.1:11434/v1
  OPENAI_MODEL=qwen3:4b
  ```
  前提是本地 Ollama 已开启，并且该模型支持对应接口。小内存设备上响应可能较慢，纠错质量也需要实际测试。

## 当前版本边界
- 尚无账号注册、云端同步、后台课程编辑系统、语音识别/TTS、支付或正式部署。
- 经验值和进度只保存在当前浏览器，不同设备不会自动同步。
- 当前小游戏是词汇选择题，后续可增加听力、拼句、角色扮演和冒险地图。
- 本地开发服务不是公开网站。要让其他人通过互联网访问，需要部署到支持 Node.js 的服务器，并配置 HTTPS、限流、日志和密钥管理。
