import Address from "../../../@shared/domain/value-object/address";
import Id from "../../../@shared/domain/value-object/id.value-object";
import Invoice from "../../domain/invoice";
import InvoiceItem from "../../domain/invoice-item";
import { FindInvoiceUseCaseInputDTO } from "./find-invoice.dto";
import FindInvoiceUseCase from "./find-invoice.usecase";

const address = new Address(
  "Street 1",
  "123",
  "Apt 1",
  "City 1",
  "State 1",
  "12345-678"
);

const items: InvoiceItem[] = [
    new InvoiceItem({
      id: new Id("1"),
      name: "Item 1",
      price: 100,
    }),
    new InvoiceItem({
      id: new Id("2"),
      name: "Item 2",
      price: 200,
    }),
];

const invoce: Invoice = new Invoice({
  id: new Id("1"),
  name: "Invoice 1",
  document: "123456789",
  address: address,
  items: items,
  createdAt: new Date(),
  updatedAt: new Date(),
});


const MockRepository = () => {
  return {
    generate: jest.fn(),
    find: jest.fn().mockReturnValue(Promise.resolve(invoce)),
  };
};


describe("Find Invoice usecase unit test", () => {
  it("should find a invoice", async () => {
    const invoiceRepository = MockRepository();
    const usecase = new FindInvoiceUseCase(invoiceRepository);

    const input: FindInvoiceUseCaseInputDTO = {
        id: "1",
    };

    const result = await usecase.execute(input);

    expect(invoiceRepository.find).toHaveBeenCalled();
    expect(result.id).toEqual(invoce.id.id);
    expect(result.name).toEqual(invoce.name);
    expect(result.document).toEqual(invoce.document);
    expect(result.address.street).toEqual(invoce.address.street);
    expect(result.address.number).toEqual(invoce.address.number);
    expect(result.address.complement).toEqual(invoce.address.complement);
    expect(result.address.city).toEqual(invoce.address.city);
    expect(result.address.state).toEqual(invoce.address.state);
    expect(result.address.zipCode).toEqual(invoce.address.zipCode);
    expect(result.items.length).toEqual(invoce.items.length);
    expect(result.items[0].id).toEqual(invoce.items[0].id.id);
    expect(result.items[0].name).toEqual(invoce.items[0].name);
    expect(result.items[0].price).toEqual(invoce.items[0].price);
    expect(result.items[1].id).toEqual(invoce.items[1].id.id);
    expect(result.items[1].name).toEqual(invoce.items[1].name);
    expect(result.items[1].price).toEqual(invoce.items[1].price);
    expect(result.total).toEqual(300);
    expect(result.createdAt).toEqual(invoce.createdAt);
  });
});