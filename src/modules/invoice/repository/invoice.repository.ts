import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import Invoice from "../domain/invoice";
import InvoiceItem from "../domain/invoice-item";
import InvoiceGateway from "../gateway/invoice.gateway";
import { InvoiceItemModel } from "./invoice-item.model";
import { InvoiceModel } from "./invoice.model";

export default class InvoiceRepository implements InvoiceGateway {

    async generate(invoice: Invoice): Promise<void> {
        const items = invoice.items.map((item) => {
            return {
                id: item.id.id,
                name: item.name,
                price: item.price,
                invoiceId: invoice.id.id,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            }
        });

        await InvoiceModel.create({
            id: invoice.id.id,
            name: invoice.name,
            document: invoice.document,
            street: invoice.address.street,
            number: invoice.address.number,
            complement: invoice.address.complement,
            city: invoice.address.city,
            state: invoice.address.state,
            zipcode: invoice.address.zipCode,
            items: items,
            createdAt: invoice.createdAt,
            updatedAt: invoice.updatedAt
        }, {
            include: [{ model: InvoiceItemModel }]
        });
    }

    async find(id: string): Promise<Invoice> {
        const invoiceModel = await InvoiceModel.findOne({
            where: { id: id },
            include: ["items"]
        });

        if (!invoiceModel) {
            throw new Error("Invoice not found");
        }

        const items = invoiceModel.items.map((item) => {
            return new InvoiceItem({
                id: new Id(item.id),
                name: item.name,
                price: item.price,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
            });
        });

        return new Invoice({
            id: new Id(invoiceModel.id),
            name: invoiceModel.name,
            document: invoiceModel.document,
            address: new Address(
                invoiceModel.street,
                invoiceModel.number,
                invoiceModel.complement,
                invoiceModel.city,
                invoiceModel.state,
                invoiceModel.zipcode
            ),
            items: items,
            createdAt: invoiceModel.createdAt,
            updatedAt: invoiceModel.updatedAt
        });
    }

}