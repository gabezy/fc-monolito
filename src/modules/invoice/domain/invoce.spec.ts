import Address from "../../@shared/domain/value-object/address"
import Invoice from "./invoice"
import InvoiceItem from "./invoice-item";

describe("Invoice Unit Test", () => {

    it("Should create a valid invoice", () => {
        const address = new Address(
            "Street 1",
            "123",
            "Complement 1",
            "City 1",
            "State 1",
            "12345-678"
        );

        const invoice = new Invoice({
            name: "Invoice 1",
            document: "123456789",
            address: address,
        });

        expect(invoice).toBeDefined();
        expect(invoice.name).toBe("Invoice 1");
        expect(invoice.document).toBe("123456789");
        expect(invoice.address).toBe(address);
        expect(invoice.items.length).toBe(0);
    });

    it("Should not create an invoice with invalid name", () => {
        const address = new Address(
            "Street 1",
            "123",
            "Complement 1",
            "City 1",
            "State 1",
            "12345-678"
        );

        expect(() => {
            new Invoice({
                name: "",
                document: "123456789",
                address: address,
            });
        }).toThrowError("Name is required");
    });

    it("Should add items to the invoice", () => {
        const address = new Address(
            "Street 1",
            "123",
            "Complement 1",
            "City 1",
            "State 1",
            "12345-678"
        );

        const invoice = new Invoice({
            name: "Invoice 1",
            document: "123456789",
            address: address,
        });

        const item1 = new InvoiceItem({ name: "Item 1", price: 100 });
        const item2 = new InvoiceItem({ name: "Item 2", price: 200 });

        invoice.add(item1);
        invoice.add(item2);

        expect(invoice.items.length).toBe(2);
        expect(invoice.items[0]).toBe(item1);
        expect(invoice.items[1]).toBe(item2);
    });

})