import { Sequelize } from "sequelize-typescript";
import request from "supertest";
import { setupDb } from "../../db/sequelize";
import { app } from "../express";

describe("E2E test for products", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = await setupDb();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a product", async () => {
    const response = await request(app).post("/products").send({
      name: "Product 1",
      description: "Product 1 description",
      purchasePrice: 80,
      salesPrice: 100,
      stock: 10,
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe("Product 1");
    expect(response.body.description).toBe("Product 1 description");
    expect(response.body.purchasePrice).toBe(80);
    expect(response.body.salesPrice).toBe(100);
    expect(response.body.stock).toBe(10);
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
  });

  it("should not create a product with missing fields", async () => {
    const response = await request(app).post("/products").send({
      name: "Product 1",
    });

    expect(response.status).toBe(400);
  });
});
