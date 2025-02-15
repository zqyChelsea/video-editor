const express = require('express');
const fileRoutes = require('./routes/fileRoutes');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 5000;

// 解析 JSON 请求体
app.use(express.json());

// 使用 CORS 中间件，允许所有来源的请求
app.use(cors());

// 提供静态文件访问（如上传文件的目录）
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// 提供对 outlines 目录的访问
app.use('/outlines', express.static(path.join(__dirname, '../outlines')));

// 接口路由，所有 API 路径以 /api 开头
app.use('/api', fileRoutes);

app.listen(port, () => {
  console.log(`Server运行在端口 ${port}`);
});
