const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 全局未捕获异常处理
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常导致服务器崩溃:', error);
  console.error('错误堆栈:', error.stack);
  process.exit(1); // 强制退出Node进程
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  // 不退出进程，只记录日志
});

// 加载环境变量
dotenv.config();

// 简单日志记录函数
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  if (type === 'error') {
    console.error(`[${timestamp}] ERROR: ${message}`);
  } else {
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }
};

// 导入数据库配置和模型
const { connectDB } = require('./config/db');
const { sequelize } = require('./models');

// 导入路由
log('正在加载路由模块...');
try {
  var authRoutes = require('./routes/auth');
  var userRoutes = require('./routes/users');
  var productRoutes = require('./routes/products');
  var orderRoutes = require('./routes/orders');
  log('所有路由模块加载成功');
} catch (error) {
  log(`路由模块加载失败: ${error.message}`, 'error');
  process.exit(1);
}

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
  log(`创建public目录: ${publicDir}`);
  fs.mkdirSync(publicDir, { recursive: true });
}

log('加载HTML模板文件...');
// 读取HTML模板文件
try {
  var indexTemplate = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
  var notFoundTemplate = fs.readFileSync(path.join(publicDir, '404.html'), 'utf8');
  log('HTML模板加载成功');
} catch (error) {
  log(`HTML模板加载失败: ${error.message}`, 'error');
  process.exit(1);
}

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
  
  log(`接收到根路径请求 - ${req.ip}`);
  
  // 确保设置正确的Content-Type
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // 返回状态页面
  res.status(200).send(html);
});

// 设置健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 捕获所有未处理的路由，返回404页面
app.use((req, res) => {
  log(`404 - 未找到路径: ${req.originalUrl}`, 'warn');
  res.status(404).send(notFoundTemplate);
});

// 错误处理中间件
app.use((err, req, res, next) => {
  log(`服务器错误: ${err.message}`, 'error');
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 设置服务器端口
const PORT = process.env.PORT || 8080;

// 尝试启动服务器，包含重试逻辑
const startServer = async () => {
  let retryCount = 0;
  const maxRetries = 5;
  
  while (retryCount < maxRetries) {
    try {
      log('尝试连接数据库...');
      
      // 连接数据库
      await connectDB();
      log('数据库连接成功');
      
      // 同步数据库模型
      log('同步数据库模型...');
      await sequelize.sync();
      log('数据库表同步成功');
      
      // 启动HTTP服务器
      const server = app.listen(PORT, '0.0.0.0', () => {
        log(`服务器成功运行在端口: ${PORT}`);
        log(`您可以访问 http://localhost:${PORT} 查看服务状态`);
      });
      
      // 监听HTTP服务器错误
      server.on('error', (error) => {
        log(`HTTP服务器错误: ${error.message}`, 'error');
        
        if (error.code === 'EADDRINUSE') {
          log(`端口 ${PORT} 已被占用，请尝试其他端口`, 'error');
        }
        
        process.exit(1);
      });
      
      // 成功启动，退出循环
      break;
    } catch (error) {
      retryCount++;
      log(`启动服务器失败 (尝试 ${retryCount}/${maxRetries}): ${error.message}`, 'error');
      
      if (error.name === 'SequelizeConnectionError' || 
          error.name === 'SequelizeConnectionRefusedError' ||
          error.name === 'SequelizeHostNotFoundError' ||
          error.name === 'SequelizeAccessDeniedError') {
        
        log('数据库连接错误 - 请确保 MySQL 服务已启动且配置正确');
        log('检查 .env 文件中的数据库配置是否正确');
        
        if (retryCount < maxRetries) {
          const retryDelay = 3000; // 3秒
          log(`将在 ${retryDelay/1000} 秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
      }
      
      // 如果达到最大重试次数或不是数据库连接错误，则退出
      log('启动服务器失败，退出程序', 'error');
      process.exit(1);
    }
  }
};

// 调用启动函数
log('正在启动服务器...');
startServer();