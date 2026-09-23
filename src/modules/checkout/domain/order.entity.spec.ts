import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import Client from "./client.entity";
import Order from "./order.entity";
import Product from "./product.entity";

describe("Order entity unit test", () => {
  const client = new Client({
    id: new Id("c1"),
    name: "John",
    email: "john@email.com",
    document: "123",
    address: new Address("Rua 123", "99", "Casa Verde", "Criciúma", "SC", "88888-888"),
  });
  const products = [
    new Product({ id: new Id("p1"), name: "P1", description: "d1", salesPrice: 40 }),
    new Product({ id: new Id("p2"), name: "P2", description: "d2", salesPrice: 60 }),
  ];

  it("should create a pending order and compute total", () => {
    const order = new Order({ client, products });

    expect(order.id.id).toBeDefined();
    expect(order.status).toBe("pending");
    expect(order.invoiceId).toBeUndefined();
    expect(order.total).toBe(100);
  });

  it("should approve an order", () => {
    const order = new Order({ client, products });
    order.approved("i1");

    expect(order.status).toBe("approved");
    expect(order.invoiceId).toBe("i1");
  });

  it("should decline an order", () => {
    const order = new Order({ client, products });
    order.declined();

    expect(order.status).toBe("declined");
  });
});
