import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

// 用户注册和登录路由
router.post('/register', register);
router.post('/login', login);

// 获取登录用户信息，需要先通过认证中间件
router.get('/me', protect, getMe);
router.get('/logout', protect, logout);

export default router;
