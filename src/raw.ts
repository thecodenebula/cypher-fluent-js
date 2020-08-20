import { GenStatement } from './gen_statement';

export class Raw implements GenStatement {
  readonly value: string;
  constructor(value: string) {
    this.value = value;
  }

  toStatement(): string {
    return this.value;
  }
}

export const raw: (value: string) => Raw = (value: string) => new Raw(value);
