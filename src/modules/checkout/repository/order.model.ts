import { Column, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import { OrderItemModel } from "./order-item.model";

@Table({
  tableName: "orders",
  timestamps: false,
})
export class OrderModel extends Model {
  @PrimaryKey
  @Column({ allowNull: false })
  id: string;

  @Column({ allowNull: false, field: "client_id" })
  clientId: string;

  @Column({ allowNull: false, field: "client_name" })
  clientName: string;

  @Column({ allowNull: false, field: "client_email" })
  clientEmail: string;

  @Column({ allowNull: false, field: "client_document" })
  clientDocument: string;

  @Column({ allowNull: false })
  street: string;

  @Column({ allowNull: false })
  number: string;

  @Column({ allowNull: true })
  complement: string;

  @Column({ allowNull: false })
  city: string;

  @Column({ allowNull: false })
  state: string;

  @Column({ allowNull: false })
  zipcode: string;

  @Column({ allowNull: false })
  status: string;

  @Column({ allowNull: true, field: "invoice_id" })
  invoiceId: string;

  @HasMany(() => OrderItemModel)
  items: OrderItemModel[];

  @Column({ allowNull: false })
  createdAt: Date;

  @Column({ allowNull: false })
  updatedAt: Date;
}
