import AggregateRoot from "../../@shared/domain/entity/aggregate-root.interface";
import BaseEntity from "../../@shared/domain/entity/base.entity";
import Address from "../../@shared/domain/value-object/address";
import Id from "../../@shared/domain/value-object/id.value-object";
import InvoiceItem from "./invoice-item";

type InvoiceProps = {
    id?: Id;
    name: string;
    document: string;
    address: Address;
    items?: InvoiceItem[];
    createdAt?: Date;
    updatedAt?: Date;
}

export default class Invoice extends BaseEntity implements AggregateRoot {

    private _name: string;
    private _document: string;
    private _address: Address;
    private _items: InvoiceItem[];

    constructor(props: InvoiceProps) {
        super(props.id, props.createdAt, props.updatedAt);
        this._name = props.name;
        this._document = props.document;
        this._address = props.address;
        this._items = props.items || [];
        this.validate();
    }

    private validate() {
        if (this._name.length <= 0) {
            throw new Error("Name is required");
        }

        if (this._document.length <= 0) {
            throw new Error("Document is required");
        }
    }

    get name(): string {
        return this._name;
    }

    get document(): string {
        return this._document;
    }

    get address(): Address {
        return this._address;
    }

    add(item: InvoiceItem) {
        this._items.push(item);
    }

    get items(): InvoiceItem[] {
        return this._items;
    }
}