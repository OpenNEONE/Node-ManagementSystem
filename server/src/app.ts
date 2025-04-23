// app.ts - TypeScript重构版本
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { sequelize } from './config/db';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app: Application = express();

// 保持与原有一致的 CORS 配置（如需更细粒度可补充）
app.use(cors({ origin: '*', credentials: true }));
// 保持与原有一致的 bodyParser 配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 静态资源托管
const publicDir = path.resolve(__dirname, '../public');
app.use(express.static(publicDir));

// 读取模板内容（仅在服务启动时读取一次）
const indexTemplate = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
const notFoundTemplate = fs.readFileSync(path.join(publicDir, '404.html'), 'utf8');

// 首页动态渲染
app.get('/', (req: Request, res: Response) => {
  const html = indexTemplate.replace('{{serverTime}}', new Date().toLocaleString());
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).send(html);
});

// 健康检查接口
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// 路由注册
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// 404 页面（返回静态 404.html）
app.use((req: Request, res: Response) => {
  res.status(404).setHeader('Content-Type', 'text/html');
  res.send(notFoundTemplate);
});

// 统一错误处理中间件
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

export default app;
