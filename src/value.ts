import { GenStatement } from './gen_statement';

export class Value<T> implements GenStatement {
  readonly value: T;
  constructor(value: T) {
    this.value = value;
  }

  toStatement(): string {
    if (typeof this.value === 'string') {
      return `'${this.value}'`;
    }
    return this.value.toString();
  }
}

export const value = <T>(value: T) => new Value<T>(value);
