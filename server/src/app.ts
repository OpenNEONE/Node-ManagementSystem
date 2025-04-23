// app.ts - TypeScript重构增强版
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { log } from "./utils";

// 路由模块声明
let authRoutes: any, userRoutes: any, productRoutes: any, orderRoutes: any;

const app: Application = express();

// CORS配置，允许所有来源、方法和头
app.use(
  cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 解析body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// morgan日志
app.use(morgan("dev"));

// 全局未捕获异常处理
process.on("uncaughtException", (error) => {
  log(`未捕获的异常导致服务器崩溃: ${error}`, "error");
  log(`错误堆栈: ${error.stack}`, "error");
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  log(`未处理的Promise拒绝: ${reason}`, "error");
});

dotenv.config();

// 自动创建public目录
const publicDir = path.resolve(__dirname, "../public");
if (!fs.existsSync(publicDir)) {
  log(`创建public目录: ${publicDir}`);
  fs.mkdirSync(publicDir, { recursive: true });
}

// 加载HTML模板文件，异常捕获
let indexTemplate = "";
let notFoundTemplate = "";
try {
  indexTemplate = fs.readFileSync(path.join(publicDir, "index.ejs"), "utf8");
  notFoundTemplate = fs.readFileSync(path.join(publicDir, "404.html"), "utf8");
  log("HTML模板加载成功");
} catch (error: any) {
  log(`HTML模板加载失败: ${error.message}`, "error");
  process.exit(1);
}

// 路由模块加载异常捕获
log("正在加载路由模块...");
try {
  authRoutes = require("./routes/auth").default;
  userRoutes = require("./routes/users").default;
  productRoutes = require("./routes/products").default;
  orderRoutes = require("./routes/orders").default;
  log("所有路由模块加载成功");
} catch (error: any) {
  log(`路由模块加载失败: ${error.message}`, "error");
  process.exit(1);
}

// 静态资源托管
app.use(express.static(publicDir));

// 首页动态渲染
app.get("/", (req: Request, res: Response) => {
  const html = indexTemplate.replace(
    "{{serverTime}}",
    new Date().toLocaleString()
  );
  log(`接收到根路径请求 - ${req.ip}`);
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).send(html);
});

// 健康检查接口，统一为 /api/health
app.get("/api/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "UP",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 路由注册
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// 404 页面（返回静态 404.html 并记录日志）
app.use((req: Request, res: Response) => {
  log(`404 - 未找到路径: ${req.originalUrl}`, "warn");
  res.status(404).setHeader("Content-Type", "text/html");
  res.send(notFoundTemplate);
});

// 错误处理中间件（记录日志）
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  log(`服务器错误: ${err.message}`, "error");
  if (err.stack) log(err.stack, "error");
  res.status(500).json({
    success: false,
    message: "服务器内部错误",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

export default app;
