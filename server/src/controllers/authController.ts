import { Request, Response } from 'express';
import { User } from '../models';

// 生成token并发送响应
const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  // 创建token
  const token = user.getSignedJwtToken();
  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  };
  res.status(statusCode).json({
    success: true,
    token,
    user: userData
  });
};

// @描述 用户登录
// @路由 POST /api/auth/login
// @访问 公开
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: '请提供邮箱和密码' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: '用户不存在' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '密码错误' });
    }
    sendTokenResponse(user, 200, res);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述 注册用户
// @路由 POST /api/auth/register
// @访问 公开
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: '该邮箱已被注册' });
    }
    const user = await User.create({ name, email, password, role: role || 'user' });
    sendTokenResponse(user, 201, res);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述 获取当前登录用户
// @路由 GET /api/auth/me
// @访问 私有
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk((req as any).user.id, {
      attributes: { exclude: ['password'] }
    });
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述 退出登录
// @路由 GET /api/auth/logout
// @访问 私有
export const logout = async (req: Request, res: Response) => {
  res.status(200).json({ success: true, message: '已退出登录' });
};
