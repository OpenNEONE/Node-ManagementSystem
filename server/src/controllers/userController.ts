import { Request, Response } from 'express';
import { User } from '../models';

// @描述 获取所有用户
// @路由 GET /api/users
// @访问 私有/管理员
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述 获取单个用户
// @路由 GET /api/users/:id
// @访问 私有/管理员
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ success: false, message: '未找到该用户' });
    }
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

// @描述 创建用户
// @路由 POST /api/users
// @访问 私有/管理员
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, status } = req.body;
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ success: false, message: '该邮箱已被注册' });
    }
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      status: status || 'active'
    });
    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @描述 更新用户
// @路由 PUT /api/users/:id
// @访问 私有/管理员
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, status } = req.body;
    let user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '未找到该用户' });
    }
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    await user.update(updateData);
    user = await User.findByPk(req.params.id, {
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

// @描述 删除用户
// @路由 DELETE /api/users/:id
// @访问 私有/管理员
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: '未找到该用户' });
    }
    await user.destroy();
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};
