import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "admin" | "manager" | "user";
  status: "active" | "inactive";
}

export interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "role" | "status"> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: "admin" | "manager" | "user";
  public status!: "active" | "inactive";

  // JWT方法
  public getSignedJwtToken(): string {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET as string, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  }

  // 密码比对
  // plainPassword参数现在是前端传来的SHA-256加密后的密码
  public async matchPassword(plainPassword: string): Promise<boolean> {
    // 直接比较SHA-256哈希值与数据库中存储的bcrypt哈希
    // 因为前端已经进行了SHA-256加密，所以不需要再次加密
    return bcrypt.compare(plainPassword, this.password);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("admin", "manager", "user"),
      defaultValue: "user",
    },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      defaultValue: "active",
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    hooks: {
      beforeSave: async (user: User) => {
        if (user.changed("password")) {
          // 前端已经使用SHA-256加密过密码，这里直接使用bcrypt进行二次加密存储
          // 注意：前端传来的是SHA-256加密后的密码，这里不需要再进行SHA-256加密
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

export default User;
