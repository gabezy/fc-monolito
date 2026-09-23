import UseCaseInterface from "../../@shared/usecase/use-case.interface";
import { FindInvoiceUseCaseOutputDTO } from "../usecase/find-invoice/find-invoice.dto";
import InvoiceFacadeInterface, { FindInvoiceFacadeInputDto, FindInvoiceFacadeOutputDto, GenerateInvoiceFacadeInputDto, GenerateInvoiceFacadeOutputDto } from "./invoice.facade.interface";

export interface UseCaseProps {
    generateUsecase: UseCaseInterface;
    findUsecase: UseCaseInterface;
}

export class InvoiceFacade implements InvoiceFacadeInterface {

    private _generateUsecase: UseCaseInterface;
    private _findUsecase: UseCaseInterface;

    constructor(usecaseProps: UseCaseProps) {
        this._generateUsecase = usecaseProps.generateUsecase;
        this._findUsecase = usecaseProps.findUsecase;
    }

    async generate(input: GenerateInvoiceFacadeInputDto): Promise<GenerateInvoiceFacadeOutputDto> {
        return await this._generateUsecase.execute(input);
    }

    async find(input: FindInvoiceFacadeInputDto): Promise<FindInvoiceFacadeOutputDto> {
        const result: FindInvoiceUseCaseOutputDTO  = await this._findUsecase.execute(input);
        return {
            id: result.id,
            name: result.name,
            document: result.document,
            street: result.address.street,
            number: result.address.number,
            complement: result.address.complement,
            city: result.address.city,
            state: result.address.state,
            zipCode: result.address.zipCode,
            items: result.items.map((item) => {
                return {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                };
            }),
            total: result.total,
            createdAt: result.createdAt,
            updatedAt: result.createdAt,
        };
    }

}