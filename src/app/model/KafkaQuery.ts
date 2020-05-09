export class KafkaQuery {
  field: string;
  value: any;
  action: string;

  constructor(field: string, value: any, action: string) {
    this.field = field;
    this.value = value;
    this.action = action;
  }
}
