import Address from "../../../@shared/domain/value-object/address";
import Id from "../../../@shared/domain/value-object/id.value-object";
import UseCaseInterface from "../../../@shared/usecase/use-case.interface";
import ClientAdmFacadeInterface from "../../../client-adm/facade/client-adm.facade.interface";
import InvoiceFacadeInterface from "../../../invoice/facade/invoice.facade.interface";
import PaymentFacadeInterface from "../../../payment/facade/facade.interface";
import ProductAdmFacadeInterface from "../../../product-adm/facade/product-adm.facade.interface";
import StoreCatalogFacadeInterface from "../../../store-catalog/facade/store-catalog.facade.interface";
import Client from "../../domain/client.entity";
import Order from "../../domain/order.entity";
import Product from "../../domain/product.entity";
import CheckoutGateway from "../../gateway/checkout.gateway";
import { PlaceOrderInputDto, PlaceOrderOutputDto } from "./place-order.dto";

export default class PlaceOrderUseCase implements UseCaseInterface {
  constructor(
    private readonly clientFacade: ClientAdmFacadeInterface,
    private readonly productFacade: ProductAdmFacadeInterface,
    private readonly catalogFacade: StoreCatalogFacadeInterface,
    private readonly repository: CheckoutGateway,
    private readonly invoiceFacade: InvoiceFacadeInterface,
    private readonly paymentFacade: PaymentFacadeInterface
  ) {}

  async execute(input: PlaceOrderInputDto): Promise<PlaceOrderOutputDto> {
    const clientData = await this.clientFacade.find({ id: input.clientId });
    if (!clientData) {
      throw new Error("Client not found");
    }

    await this.validateProducts(input);

    const products = await Promise.all(
      input.products.map((p) => this.getProduct(p.productId))
    );

    const client = new Client({
      id: new Id(clientData.id),
      name: clientData.name,
      email: clientData.email,
      document: clientData.document,
      address: new Address(
        clientData.address.street,
        clientData.address.number,
        clientData.address.complement,
        clientData.address.city,
        clientData.address.state,
        clientData.address.zipCode
      ),
    });

    const order = new Order({ client, products });

    const payment = await this.paymentFacade.process({
      orderId: order.id.id,
      amount: order.total,
    });

    if (payment.status === "approved") {
      const invoice = await this.invoiceFacade.generate({
        name: client.name,
        document: client.document,
        street: client.address.street,
        number: client.address.number,
        complement: client.address.complement,
        city: client.address.city,
        state: client.address.state,
        zipCode: client.address.zipCode,
        items: products.map((p) => ({
          id: p.id.id,
          name: p.name,
          price: p.salesPrice,
        })),
      });
      order.approved(invoice.id);
    } else {
      order.declined();
    }

    await this.repository.addOrder(order);

    return {
      id: order.id.id,
      invoiceId: order.invoiceId || null,
      status: order.status,
      total: order.total,
      products: order.products.map((p) => ({ productId: p.id.id })),
    };
  }

  private async validateProducts(input: PlaceOrderInputDto): Promise<void> {
    if (!input.products || input.products.length === 0) {
      throw new Error("No products selected");
    }

    for (const p of input.products) {
      const product = await this.productFacade.checkStock({
        productId: p.productId,
      });
      if (product.stock <= 0) {
        throw new Error(`Product ${product.productId} is not available in stock`);
      }
    }
  }

  private async getProduct(productId: string): Promise<Product> {
    const product = await this.catalogFacade.find({ id: productId });
    if (!product) {
      throw new Error("Product not found");
    }

    return new Product({
      id: new Id(product.id),
      name: product.name,
      description: product.description,
      salesPrice: product.salesPrice,
    });
  }
}
