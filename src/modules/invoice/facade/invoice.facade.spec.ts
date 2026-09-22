import { Sequelize } from "sequelize-typescript"
import Address from "../../@shared/domain/value-object/address"
import Id from "../../@shared/domain/value-object/id.value-object"
import Invoice from "../domain/invoice"
import InvoiceItem from "../domain/invoice-item"
import { InvoiceItemModel } from "../repository/invoice-item.model"
import { InvoiceModel } from "../repository/invoice.model"
import InvoiceRepository from "../repository/invoice.repository"
import FindInvoiceUseCase from "../usecase/find-invoice/find-invoice.usecase"
import { GenerateInvoiceUseCase } from "../usecase/generate-invoice/generate-invoice.usecase"
import { InvoiceFacade } from "./invoice.facade"

describe("Invoice Facade test", () => {

  let sequelize: Sequelize

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
      sync: { force: true }
    })

    sequelize.addModels([InvoiceModel, InvoiceItemModel])
    await sequelize.sync()
  })

  afterEach(async () => {
    await sequelize.close()
  })

  const createFacade = () => {
    const repository = new InvoiceRepository()
    return new InvoiceFacade({
      generateUsecase: new GenerateInvoiceUseCase(repository),
      findUsecase: new FindInvoiceUseCase(repository),
    })
  }

  it("should generate an invoice", async () => {

    const facade = createFacade()

    const input = {
      name: "Invoice 1",
      document: "1234-5678",
      street: "Rua 123",
      number: "99",
      complement: "Casa Verde",
      city: "Criciúma",
      state: "SC",
      zipCode: "88888-888",
      items: [
        { id: "1", name: "Item 1", price: 100 },
        { id: "2", name: "Item 2", price: 200 },
      ],
    }

    await facade.generate(input)

    const invoiceDb = await InvoiceModel.findOne({
      include: [{ model: InvoiceItemModel }],
    })

    expect(invoiceDb).toBeDefined()
    expect(invoiceDb.id).toBeDefined()
    expect(invoiceDb.name).toBe(input.name)
    expect(invoiceDb.document).toBe(input.document)
    expect(invoiceDb.street).toBe(input.street)
    expect(invoiceDb.number).toBe(input.number)
    expect(invoiceDb.complement).toBe(input.complement)
    expect(invoiceDb.city).toBe(input.city)
    expect(invoiceDb.state).toBe(input.state)
    expect(invoiceDb.zipcode).toBe(input.zipCode)

    expect(invoiceDb.items.length).toBe(2)
    expect(invoiceDb.items[0].id).toBe(input.items[0].id)
    expect(invoiceDb.items[0].name).toBe(input.items[0].name)
    expect(invoiceDb.items[0].price).toBe(input.items[0].price)
    expect(invoiceDb.items[1].id).toBe(input.items[1].id)
    expect(invoiceDb.items[1].name).toBe(input.items[1].name)
    expect(invoiceDb.items[1].price).toBe(input.items[1].price)
  })

  it("should find an invoice", async () => {

    const invoice = new Invoice({
      id: new Id("1"),
      name: "Invoice 1",
      document: "1234-5678",
      address: new Address(
        "Rua 123",
        "99",
        "Casa Verde",
        "Criciúma",
        "SC",
        "88888-888"
      ),
      items: [
        new InvoiceItem({ id: new Id("1"), name: "Item 1", price: 100 }),
        new InvoiceItem({ id: new Id("2"), name: "Item 2", price: 200 }),
      ],
    })

    await new InvoiceRepository().generate(invoice)

    const facade = createFacade()
    const result = await facade.find({ id: "1" })

    expect(result.id).toBe("1")
    expect(result.name).toBe(invoice.name)
    expect(result.document).toBe(invoice.document)
    expect(result.street).toBe(invoice.address.street)
    expect(result.number).toBe(invoice.address.number)
    expect(result.complement).toBe(invoice.address.complement)
    expect(result.city).toBe(invoice.address.city)
    expect(result.state).toBe(invoice.address.state)
    expect(result.zipCode).toBe(invoice.address.zipCode)
    expect(result.total).toBe(300)
    expect(result.createdAt).toStrictEqual(invoice.createdAt)
    expect(result.updatedAt).toStrictEqual(invoice.updatedAt)

    expect(result.items.length).toBe(2)
    expect(result.items[0].id).toBe("1")
    expect(result.items[0].name).toBe("Item 1")
    expect(result.items[0].price).toBe(100)
    expect(result.items[1].id).toBe("2")
    expect(result.items[1].name).toBe("Item 2")
    expect(result.items[1].price).toBe(200)
  })

  it("should throw an error when the invoice is not found", async () => {

    const facade = createFacade()

    await expect(facade.find({ id: "1" })).rejects.toThrowError("Invoice not found")
  })
})
