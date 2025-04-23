import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

export interface ProductAttributes {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  status: 'active' | 'inactive';
}

export interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'description' | 'image' | 'status'> {}

class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public price!: number;
  public stock!: number;
  public category!: string;
  public image?: string;
  public status!: 'active' | 'inactive';
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active'
    }
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products'
  }
);

export default Product;
