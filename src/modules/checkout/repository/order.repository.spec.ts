import { Sequelize } from "sequelize-typescript";
import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import Client from "../domain/client.entity";
import Order from "../domain/order.entity";
import Product from "../domain/product.entity";
import { OrderItemModel } from "./order-item.model";
import { OrderModel } from "./order.model";
import OrderRepository from "./order.repository";

describe("OrderRepository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    sequelize.addModels([OrderModel, OrderItemModel]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should add and find an order", async () => {
    const order = new Order({
      id: new Id("o1"),
      client: new Client({
        id: new Id("c1"),
        name: "John",
        email: "john@email.com",
        document: "123",
        address: new Address("Rua 123", "99", "Casa Verde", "Criciúma", "SC", "88888-888"),
      }),
      products: [
        new Product({ id: new Id("p1"), name: "P1", description: "d1", salesPrice: 100 }),
        new Product({ id: new Id("p2"), name: "P2", description: "d2", salesPrice: 50 }),
      ],
    });
    order.approved("i1");

    const repository = new OrderRepository();
    await repository.addOrder(order);

    const result = await repository.findOrder("o1");

    expect(result.id.id).toBe("o1");
    expect(result.status).toBe("approved");
    expect(result.invoiceId).toBe("i1");
    expect(result.total).toBe(150);
    expect(result.client.id.id).toBe("c1");
    expect(result.client.name).toBe("John");
    expect(result.client.address.zipCode).toBe("88888-888");
    expect(result.products.map((p) => p.id.id)).toEqual(["p1", "p2"]);
    expect(result.createdAt).toStrictEqual(order.createdAt);
  });

  it("should return null when order is not found", async () => {
    const result = await new OrderRepository().findOrder("x");

    expect(result).toBeNull();
  });
});
