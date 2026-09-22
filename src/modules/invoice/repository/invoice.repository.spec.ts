import { Sequelize } from "sequelize-typescript"
import { InvoiceModel } from "./invoice.model"
import { InvoiceItemModel } from "./invoice-item.model"
import InvoiceRepository from "./invoice.repository"
import Invoice from "../domain/invoice"
import InvoiceItem from "../domain/invoice-item"
import Address from "../../@shared/domain/value-object/address"
import Id from "../../@shared/domain/value-object/id.value-object"

describe("Invoice Repository test", () => {

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

    it("should generate an invoice with its items", async () => {

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
            ]
        })

        const repository = new InvoiceRepository()
        await repository.generate(invoice)

        const invoiceDb = await InvoiceModel.findOne({
            where: { id: "1" },
            include: [{ model: InvoiceItemModel }],
        })

        expect(invoiceDb).toBeDefined()
        expect(invoiceDb.id).toEqual(invoice.id.id)
        expect(invoiceDb.name).toEqual(invoice.name)
        expect(invoiceDb.document).toEqual(invoice.document)
        expect(invoiceDb.street).toEqual(invoice.address.street)
        expect(invoiceDb.number).toEqual(invoice.address.number)
        expect(invoiceDb.complement).toEqual(invoice.address.complement)
        expect(invoiceDb.city).toEqual(invoice.address.city)
        expect(invoiceDb.state).toEqual(invoice.address.state)
        expect(invoiceDb.zipcode).toEqual(invoice.address.zipCode)
        expect(invoiceDb.createdAt).toStrictEqual(invoice.createdAt)
        expect(invoiceDb.updatedAt).toStrictEqual(invoice.updatedAt)

        expect(invoiceDb.items.length).toBe(2)
        expect(invoiceDb.items[0].id).toEqual(invoice.items[0].id.id)
        expect(invoiceDb.items[0].name).toEqual(invoice.items[0].name)
        expect(invoiceDb.items[0].price).toEqual(invoice.items[0].price)
        expect(invoiceDb.items[0].invoiceId).toEqual(invoice.id.id)
        expect(invoiceDb.items[1].id).toEqual(invoice.items[1].id.id)
        expect(invoiceDb.items[1].name).toEqual(invoice.items[1].name)
        expect(invoiceDb.items[1].price).toEqual(invoice.items[1].price)
        expect(invoiceDb.items[1].invoiceId).toEqual(invoice.id.id)
    })

    it("should generate an invoice without items", async () => {

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
        })

        const repository = new InvoiceRepository()
        await repository.generate(invoice)

        const invoiceDb = await InvoiceModel.findOne({
            where: { id: "1" },
            include: [{ model: InvoiceItemModel }],
        })

        expect(invoiceDb).toBeDefined()
        expect(invoiceDb.items.length).toBe(0)
    })

    it("should find an invoice with its items", async () => {

        const createdAt = new Date()
        const updatedAt = new Date()

        await InvoiceModel.create({
            id: "1",
            name: "Invoice 1",
            document: "1234-5678",
            street: "Rua 123",
            number: "99",
            complement: "Casa Verde",
            city: "Criciúma",
            state: "SC",
            zipcode: "88888-888",
            items: [
                { id: "1", name: "Item 1", price: 100, createdAt, updatedAt },
                { id: "2", name: "Item 2", price: 200, createdAt, updatedAt },
            ],
            createdAt,
            updatedAt,
        }, {
            include: [{ model: InvoiceItemModel }],
        })

        const repository = new InvoiceRepository()
        const result = await repository.find("1")

        expect(result.id.id).toBe("1")
        expect(result.name).toBe("Invoice 1")
        expect(result.document).toBe("1234-5678")
        expect(result.address.street).toBe("Rua 123")
        expect(result.address.number).toBe("99")
        expect(result.address.complement).toBe("Casa Verde")
        expect(result.address.city).toBe("Criciúma")
        expect(result.address.state).toBe("SC")
        expect(result.address.zipCode).toBe("88888-888")
        expect(result.createdAt).toStrictEqual(createdAt)
        expect(result.updatedAt).toStrictEqual(updatedAt)

        expect(result.items.length).toBe(2)
        expect(result.items[0].id.id).toBe("1")
        expect(result.items[0].name).toBe("Item 1")
        expect(result.items[0].price).toBe(100)
        expect(result.items[1].id.id).toBe("2")
        expect(result.items[1].name).toBe("Item 2")
        expect(result.items[1].price).toBe(200)
    })

    it("should return an invoice instance when found", async () => {

        await InvoiceModel.create({
            id: "1",
            name: "Invoice 1",
            document: "1234-5678",
            street: "Rua 123",
            number: "99",
            complement: "Casa Verde",
            city: "Criciúma",
            state: "SC",
            zipcode: "88888-888",
            createdAt: new Date(),
            updatedAt: new Date(),
        })

        const repository = new InvoiceRepository()
        const result = await repository.find("1")

        expect(result).toBeInstanceOf(Invoice)
        expect(result.address).toBeInstanceOf(Address)
        expect(result.items).toEqual([])
    })

    it("should throw an error when the invoice is not found", async () => {

        const repository = new InvoiceRepository()

        await expect(repository.find("1")).rejects.toThrowError("Invoice not found")
    })
})
