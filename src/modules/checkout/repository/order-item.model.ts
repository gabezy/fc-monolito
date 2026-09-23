import { BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { OrderModel } from "./order.model";

@Table({
  tableName: "order_items",
  timestamps: false,
})
export class OrderItemModel extends Model {
  @PrimaryKey
  @Column({ allowNull: false })
  id: string;

  @Column({ allowNull: false, field: "product_id" })
  productId: string;

  @Column({ allowNull: false })
  name: string;

  @Column({ allowNull: false })
  description: string;

  @Column({ allowNull: false, field: "sales_price" })
  salesPrice: number;

  @ForeignKey(() => OrderModel)
  @Column({ allowNull: false, field: "order_id" })
  orderId: string;

  @BelongsTo(() => OrderModel)
  order: OrderModel;
}
