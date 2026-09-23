import { Sequelize } from "sequelize-typescript";
import request from "supertest";
import { setupDb } from "../../db/sequelize";
import { app } from "../express";

describe("E2E test for clients", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = await setupDb();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a client", async () => {
    const response = await request(app)
      .post("/clients")
      .send({
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
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe("John");
    expect(response.body.email).toBe("john@email.com");
    expect(response.body.document).toBe("123.456.789-00");
    expect(response.body.address).toEqual({
      street: "Rua 123",
      number: "99",
      complement: "Casa Verde",
      city: "Criciúma",
      state: "SC",
      zipCode: "88888-888",
    });
    expect(response.body.createdAt).toBeDefined();
    expect(response.body.updatedAt).toBeDefined();
  });

  it("should not create a client with missing fields", async () => {
    const response = await request(app).post("/clients").send({
      name: "John",
    });

    expect(response.status).toBe(400);
  });
});
