import { GenStatement } from './gen_statement';
import { Raw } from './raw';
import { Variable } from './variable';
import { RelationshipStatement } from './relationship_statement';
import { QueryBuilder } from './query_builder';

export enum Operators {
  AND = 'AND',
  OR = 'OR',
  XOR = 'XOR',
}

export enum WhereOperator {
  EQ = '=',
  GT = '>',
  GTE = '>=',
  LT = '<',
  LTE = '<=',
  IN = 'in',
  STARTS_WITH = 'starts with',
  ENDS_WITH = 'ends with',
  CONTAINS = 'contains',
  REGEX = '=~',
}

type WhereSide = string | number | null | Raw | Variable;

export interface WhereStatement extends GenStatement {}

export class WhereNodeLabel implements WhereStatement {
  private readonly name: string;
  private readonly labels: string[];

  constructor(name: string, label: string, ...otherLabels: string[]) {
    this.labels = [label, ...otherLabels];
    this.name = name;
  }

  toStatement(): string {
    return `${this.name}:${this.labels.join(':')}`;
  }
}

export class WhereSimple implements WhereStatement {
  left: WhereSide;
  operator: WhereOperator;
  right: WhereSide;

  constructor(left: WhereSide, operator: WhereOperator, right: WhereSide) {
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  private static getSide(r: WhereSide) {
    if (r instanceof Raw || r instanceof Variable) {
      return r.toStatement();
    } else if (typeof r === 'string') {
      return `'${r}'`;
    } else if (r === null) {
      return 'null';
    }

    return r;
  }

  toStatement(): string {
    return `${WhereSimple.getSide(this.left)} ${this.operator} ${WhereSimple.getSide(this.right)}`;
  }
}

export class WhereNot implements WhereStatement {
  private readonly statement: WhereStatement | WhereStatementChain;

  constructor(statement: WhereStatement | WhereStatementChain) {
    this.statement = statement;
  }

  toStatement(): string {
    return `NOT ${this.statement.toStatement()}`;
  }
}

export class WhereStatementChain implements GenStatement {
  private readonly chain: (Operators | WhereStatement | WhereStatementChain)[];

  constructor(...chain: (Operators | WhereStatement | WhereStatementChain)[]) {
    this.chain = chain;
  }

  and(statement: WhereStatement | WhereStatementChain) {
    return new WhereStatementChain(...this.chain, Operators.AND, statement);
  }

  or(statement: WhereStatement | WhereStatementChain) {
    return new WhereStatementChain(...this.chain, Operators.OR, statement);
  }

  xor(statement: WhereStatement | WhereStatementChain) {
    return new WhereStatementChain(...this.chain, Operators.XOR, statement);
  }

  toStatement(pretty: boolean = false): string {
    return `${this.chain
      .map((s) => (typeof s === 'string' ? s : '(' + s.toStatement() + ')'))
      .join(` ${pretty ? '\n' : ''}`)}`;
  }
}

type ExistsValue = Raw | RelationshipStatement | QueryBuilder;

export class WhereExists implements WhereStatement {
  private readonly value: ExistsValue;

  constructor(value: ExistsValue) {
    this.value = value;
  }

  toStatement(): string {
    if (this.value instanceof QueryBuilder) {
      return `exists{ ${this.value.toStatement()} }`;
    }
    return `exists(${this.value.toStatement()})`;
  }
}

export class WherePattern implements WhereStatement {
  private readonly pattern: RelationshipStatement;

  constructor(pattern: RelationshipStatement) {
    this.pattern = pattern;
  }

  toStatement(): string {
    return this.pattern.toStatement();
  }
}

export class WhereIsNull implements WhereStatement {
  private readonly value: Raw;

  constructor(value: Raw) {
    this.value = value;
  }

  toStatement(): string {
    return `${this.value.toStatement()} IS NULL`;
  }
}

export const eq: (left: WhereSide, right: WhereSide) => WhereStatementChain = (left: WhereSide, right: WhereSide) =>
  new WhereStatementChain(new WhereSimple(left, WhereOperator.EQ, right));

export const inList: (left: WhereSide, right: WhereSide) => WhereStatementChain = (left: WhereSide, right: WhereSide) =>
  new WhereStatementChain(new WhereSimple(left, WhereOperator.IN, right));

export const lt: (left: WhereSide, right: WhereSide) => WhereStatementChain = (left: WhereSide, right: WhereSide) =>
  new WhereStatementChain(new WhereSimple(left, WhereOperator.LT, right));

export const lte: (left: WhereSide, right: WhereSide) => WhereStatementChain = (left: WhereSide, right: WhereSide) =>
  new WhereStatementChain(new WhereSimple(left, WhereOperator.LTE, right));

export const gt: (left: WhereSide, right: WhereSide) => WhereStatementChain = (left: WhereSide, right: WhereSide) =>
  new WhereStatementChain(new WhereSimple(left, WhereOperator.GT, right));

export const gte: (left: WhereSide, right: WhereSide) => WhereStatementChain = (left: WhereSide, right: WhereSide) =>
  new WhereStatementChain(new WhereSimple(left, WhereOperator.GTE, right));

export const not: (statement: WhereStatement | WhereStatementChain) => WhereStatementChain = (
  statement: WhereStatement | WhereStatementChain
) => new WhereStatementChain(new WhereNot(statement));

export const startsWith: (left: WhereSide, right: WhereSide) => WhereStatementChain = (
  left: WhereSide,
  right: WhereSide
) => new WhereStatementChain(new WhereSimple(left, WhereOperator.STARTS_WITH, right));

export const endsWith: (left: WhereSide, right: WhereSide) => WhereStatementChain = (
  left: WhereSide,
  right: WhereSide
) => new WhereStatementChain(new WhereSimple(left, WhereOperator.ENDS_WITH, right));

export const contains: (left: WhereSide, right: WhereSide) => WhereStatementChain = (
  left: WhereSide,
  right: WhereSide
) => new WhereStatementChain(new WhereSimple(left, WhereOperator.CONTAINS, right));

export const regex: (left: WhereSide, right: WhereSide) => WhereStatementChain = (left: WhereSide, right: WhereSide) =>
  new WhereStatementChain(new WhereSimple(left, WhereOperator.REGEX, right));

export const nodeLabel: (name: string, label: string, ...otherLabels: string[]) => WhereStatementChain = (
  name: string,
  label: string,
  ...otherLabels: string[]
) => new WhereStatementChain(new WhereNodeLabel(name, label, ...otherLabels));

export const exists: (value: ExistsValue) => WhereStatementChain = (value: ExistsValue) =>
  new WhereStatementChain(new WhereExists(value));

export const pattern: (pattern: RelationshipStatement) => WhereStatementChain = (pattern: RelationshipStatement) =>
  new WhereStatementChain(new WherePattern(pattern));

export const isNull: (value: Raw) => WhereStatementChain = (value: Raw) =>
  new WhereStatementChain(new WhereIsNull(value));
