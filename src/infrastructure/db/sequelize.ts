import { Sequelize } from "sequelize-typescript";
import { OrderItemModel } from "../../modules/checkout/repository/order-item.model";
import { OrderModel } from "../../modules/checkout/repository/order.model";
import { ClientModel } from "../../modules/client-adm/repository/client.model";
import { InvoiceItemModel } from "../../modules/invoice/repository/invoice-item.model";
import { InvoiceModel } from "../../modules/invoice/repository/invoice.model";
import TransactionModel from "../../modules/payment/repository/transaction.model";
import { ProductModel as AdmProductModel } from "../../modules/product-adm/repository/product.model";
import CatalogProductModel from "../../modules/store-catalog/repository/product.model";

export async function setupDb(storage: string = ":memory:"): Promise<Sequelize> {
  const sequelize = new Sequelize({
    dialect: "sqlite",
    storage,
    logging: false,
  });

  sequelize.addModels([
    AdmProductModel,
    CatalogProductModel,
    ClientModel,
    InvoiceModel,
    InvoiceItemModel,
    TransactionModel,
    OrderModel,
    OrderItemModel,
  ]);

  // product-adm and store-catalog map the same "products" table. The table is
  // created from the product-adm model (which also holds salesPrice), so the
  // store-catalog model is only registered, never synced.
  const models = [
    AdmProductModel,
    ClientModel,
    InvoiceModel,
    InvoiceItemModel,
    TransactionModel,
    OrderModel,
    OrderItemModel,
  ];
  for (const model of models) {
    await model.sync();
  }

  return sequelize;
}
