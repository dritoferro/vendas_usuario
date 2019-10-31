export class KafkaQuery {
    field: string;
    value: any;

    constructor(field: string, value: any) {
        this.field = field;
        this.value = value;
    }
}
