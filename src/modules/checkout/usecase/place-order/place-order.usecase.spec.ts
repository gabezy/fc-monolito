import Address from "../../../@shared/domain/value-object/address";
import PlaceOrderUseCase from "./place-order.usecase";

const clientData = {
  id: "c1",
  name: "John",
  email: "john@email.com",
  document: "123",
  address: new Address("Rua 123", "99", "Casa Verde", "Criciúma", "SC", "88888-888"),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const catalog: Record<string, any> = {
  p1: { id: "p1", name: "P1", description: "d1", salesPrice: 100 },
  p2: { id: "p2", name: "P2", description: "d2", salesPrice: 50 },
};

const makeMocks = (paymentStatus = "approved", stock = 10) => ({
  clientFacade: { add: jest.fn(), find: jest.fn().mockResolvedValue(clientData) },
  productFacade: {
    addProduct: jest.fn(),
    checkStock: jest
      .fn()
      .mockImplementation(({ productId }) => Promise.resolve({ productId, stock })),
  },
  catalogFacade: {
    find: jest.fn().mockImplementation(({ id }) => Promise.resolve(catalog[id])),
    findAll: jest.fn(),
  },
  repository: { addOrder: jest.fn(), findOrder: jest.fn() },
  invoiceFacade: {
    generate: jest.fn().mockResolvedValue({ id: "i1" }),
    find: jest.fn(),
  },
  paymentFacade: {
    process: jest
      .fn()
      .mockImplementation(({ orderId, amount }) =>
        Promise.resolve({ transactionId: "t1", orderId, amount, status: paymentStatus })
      ),
  },
});

const makeUseCase = (m: ReturnType<typeof makeMocks>) =>
  new PlaceOrderUseCase(
    m.clientFacade,
    m.productFacade as any,
    m.catalogFacade,
    m.repository,
    m.invoiceFacade as any,
    m.paymentFacade as any
  );

describe("PlaceOrderUseCase unit test", () => {
  it("should throw when client is not found", async () => {
    const m = makeMocks();
    m.clientFacade.find.mockResolvedValue(null);

    await expect(
      makeUseCase(m).execute({ clientId: "x", products: [{ productId: "p1" }] })
    ).rejects.toThrow("Client not found");
  });

  it("should throw when no products are selected", async () => {
    const m = makeMocks();

    await expect(
      makeUseCase(m).execute({ clientId: "c1", products: [] })
    ).rejects.toThrow("No products selected");
  });

  it("should throw when product is out of stock", async () => {
    const m = makeMocks("approved", 0);

    await expect(
      makeUseCase(m).execute({ clientId: "c1", products: [{ productId: "p1" }] })
    ).rejects.toThrow("Product p1 is not available in stock");
  });

  it("should place an approved order and generate invoice", async () => {
    const m = makeMocks("approved");

    const output = await makeUseCase(m).execute({
      clientId: "c1",
      products: [{ productId: "p1" }, { productId: "p2" }],
    });

    expect(output.id).toBeDefined();
    expect(output.status).toBe("approved");
    expect(output.invoiceId).toBe("i1");
    expect(output.total).toBe(150);
    expect(output.products).toEqual([{ productId: "p1" }, { productId: "p2" }]);
    expect(m.paymentFacade.process).toHaveBeenCalledWith({ orderId: output.id, amount: 150 });
    expect(m.invoiceFacade.generate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "John",
        document: "123",
        zipCode: "88888-888",
        items: [
          { id: "p1", name: "P1", price: 100 },
          { id: "p2", name: "P2", price: 50 },
        ],
      })
    );
    expect(m.repository.addOrder).toHaveBeenCalledTimes(1);
  });

  it("should place a declined order without invoice", async () => {
    const m = makeMocks("declined");

    const output = await makeUseCase(m).execute({
      clientId: "c1",
      products: [{ productId: "p2" }],
    });

    expect(output.status).toBe("declined");
    expect(output.invoiceId).toBeNull();
    expect(m.invoiceFacade.generate).not.toHaveBeenCalled();
    expect(m.repository.addOrder).toHaveBeenCalledTimes(1);
  });
});
