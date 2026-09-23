import { Sequelize } from "sequelize-typescript";
import request from "supertest";
import { OrderModel } from "../../../modules/checkout/repository/order.model";
import { setupDb } from "../../db/sequelize";
import { app } from "../express";

describe("E2E test for checkout", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = await setupDb();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  const createClient = async () => {
    const response = await request(app)
      .post("/clients")
      .send({
        id: "c1",
        name: "John",
        email: "john@email.com",
        document: "123.456.789-00",
        address: {
          street: "Rua 123",
          number: "99",
          complement: "Casa Verde",
          city: "Criciúma",
          state: "SC",
          zipCode: "88888-888",
        },
      });
    expect(response.status).toBe(201);
  };

  const createProduct = async (id: string, salesPrice: number, stock = 10) => {
    const response = await request(app).post("/products").send({
      id,
      name: `Product ${id}`,
      description: `Product ${id} description`,
      purchasePrice: salesPrice / 2,
      salesPrice,
      stock,
    });
    expect(response.status).toBe(201);
  };

  it("should place an approved order and generate an invoice", async () => {
    await createClient();
    await createProduct("p1", 100);
    await createProduct("p2", 50);

    const response = await request(app)
      .post("/checkout")
      .send({
        clientId: "c1",
        products: [{ productId: "p1" }, { productId: "p2" }],
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.invoiceId).toBeDefined();
    expect(response.body.invoiceId).not.toBeNull();
    expect(response.body.status).toBe("approved");
    expect(response.body.total).toBe(150);
    expect(response.body.products).toEqual([
      { productId: "p1" },
      { productId: "p2" },
    ]);

    const order = await OrderModel.findOne({ where: { id: response.body.id } });
    expect(order.status).toBe("approved");
    expect(order.invoiceId).toBe(response.body.invoiceId);
  });

  it("should place a declined order without invoice", async () => {
    await createClient();
    await createProduct("p1", 50);

    const response = await request(app)
      .post("/checkout")
      .send({ clientId: "c1", products: [{ productId: "p1" }] });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe("declined");
    expect(response.body.invoiceId).toBeNull();
    expect(response.body.total).toBe(50);
  });

  it("should not place an order when client does not exist", async () => {
    await createProduct("p1", 100);

    const response = await request(app)
      .post("/checkout")
      .send({ clientId: "unknown", products: [{ productId: "p1" }] });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Client not found");
  });

  it("should not place an order when product is out of stock", async () => {
    await createClient();
    await createProduct("p1", 100, 0);

    const response = await request(app)
      .post("/checkout")
      .send({ clientId: "c1", products: [{ productId: "p1" }] });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Product p1 is not available in stock");
  });
});
