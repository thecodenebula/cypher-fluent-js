import { GenStatement } from './gen_statement';

export class Variable implements GenStatement {
  readonly value: string;
  constructor(value: string) {
    this.value = `$${value}`;
  }

  toStatement(): string {
    return this.value;
  }
}

export const variable: (value: string) => Variable = (value: string) => new Variable(value);
