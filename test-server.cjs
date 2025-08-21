const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 简单的测试路由
app.get('/test', (req, res) => {
  console.log('收到GET /test请求');
  res.json({ message: 'Hello World', timestamp: new Date().toISOString() });
});

app.put('/test-put', (req, res) => {
  console.log('收到PUT /test-put请求，数据:', req.body);
  res.json({ success: true, received: req.body });
});

const PORT = 3002;  // 使用不同端口避免冲突
app.listen(PORT, () => {
  console.log(`测试服务器运行在 http://localhost:${PORT}`);
});

process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', promise, '原因:', reason);
  process.exit(1);
});
