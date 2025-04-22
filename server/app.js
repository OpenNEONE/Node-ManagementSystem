const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 加载环境变量
dotenv.config();

// 导入数据库配置和模型
const { connectDB } = require('./config/db');
const { sequelize } = require('./models');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

// 创建Express应用
const app = express();

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置CORS，允许所有来源
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 确保public目录存在
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 读取HTML模板文件
const indexTemplate = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
const notFoundTemplate = fs.readFileSync(path.join(publicDir, '404.html'), 'utf8');

// 设置静态文件目录
app.use(express.static(publicDir));

// 设置API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 基本路由 - 返回HTML页面
app.get('/', (req, res) => {
  // 替换模板中的动态内容
  const html = indexTemplate.replace('{{serverTime}}', new Date().toLocaleString());
  
  // 确保设置正确的Content-Type
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 返回状态页面
  res.status(200).send(html);
});

// 捕获所有未处理的路由，返回404页面 - 修复了通配符路由错误
app.use((req, res) => {
  res.status(404).send(notFoundTemplate);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 设置服务器端口
const PORT = process.env.PORT || 5000;

// 启动服务器和数据库
const startServer = async () => {
  try {
    // 连接数据库
    await connectDB();
    
    // 同步数据库模型（创建表）
    await sequelize.sync();
    console.log('数据库表同步成功');
    
    // 监听端口
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`服务器运行在端口: ${PORT}`);
      console.log(`您可以访问 http://localhost:${PORT} 查看服务状态`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 调用启动函数
startServer();