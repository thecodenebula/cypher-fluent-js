import { Match } from './match_statement';
import { Matchable } from './matchable';
import { WhereStatementChain } from './where_statement';
import { Raw } from './raw';
import { Variable } from './variable';
import { GenStatement } from './gen_statement';
import { Callable } from './callable';
import { Call } from './call_statement';

export class QueryBuilder implements GenStatement {
  private matchElements: Matchable[];
  private callElement?: Callable;
  private returnElements: string[];
  private skipElements?: number | Raw | Variable;
  private limitElements?: number | Raw | Variable;
  private order: string[];
  private whereStatement?: WhereStatementChain;

  constructor(
    matchElements: Matchable[] = [],
    callElement?: Callable,
    returnElements: string[] = [],
    order: string[] = [],
    whereStatement?: WhereStatementChain,
    skip?: number | Raw | Variable,
    limit?: number | Raw | Variable
  ) {
    this.matchElements = matchElements;
    this.callElement = callElement;
    this.returnElements = returnElements;
    this.skipElements = skip;
    this.limitElements = limit;
    this.order = order;
    this.whereStatement = whereStatement;
  }

  match(...m: Matchable[]) {
    return this.copy({ matchElements: [...this.matchElements, new Match(m)] });
  }

  optionalMatch(...m: Matchable[]) {
    return this.copy({ matchElements: [...this.matchElements, new Match(m, true)] });
  }

  withMatchElements(...m: Matchable[]) {
    return this.copy({ matchElements: [...m] });
  }

  return(...items: string[]) {
    return this.copy({ returnElements: [...this.returnElements, ...items] });
  }

  withReturn(...items: string[]) {
    return this.copy({ returnElements: [...items] });
  }

  limit(limit: number | Raw | Variable) {
    return this.copy({ limitElements: limit });
  }

  skip(skip: number | Raw | Variable) {
    return this.copy({ skipElements: skip });
  }

  orderBy(...elements: string[]) {
    return this.copy({ order: [...this.order, ...elements] });
  }

  where(...statement: WhereStatementChain[]) {
    const newChain = statement.slice(1).reduce((l, r) => l.and(r), new WhereStatementChain(statement[0]));
    const whereStatement = this.whereStatement ? this.whereStatement.and(newChain) : newChain;
    return this.copy({ whereStatement });
  }

  withWhere(...statement: WhereStatementChain[]) {
    const whereStatement = statement.slice(1).reduce((l, r) => l.and(r), new WhereStatementChain(statement[0]));
    return this.copy({ whereStatement });
  }

  withCall(call: Call) {
    return this.copy({ callElement: call });
  }

  build(pretty: boolean = false) {
    return `
      ${this.callElement ? `${this.callElement.toStatement()}` : ``}
      ${this.matchElements.map((m) => m.toStatement()).join('\n')}
      ${this.whereStatement ? `WHERE ${this.whereStatement.toStatement(pretty)}` : ``}
      ${this.returnElements.length > 0 ? `RETURN ${this.returnElements.join(', ')}` : ''}
      ${this.order.length > 0 ? `ORDER BY ${this.order.join(', ')}` : ''}
      ${
        this.skipElements
          ? `SKIP ${typeof this.skipElements === 'number' ? this.skipElements : this.skipElements.toStatement()}`
          : ``
      }
      ${
        this.limitElements
          ? `LIMIT ${typeof this.limitElements === 'number' ? this.limitElements : this.limitElements.toStatement()}`
          : ``
      }
    `
      .split('\n')
      .map((line) => line.trim())
      .filter((l) => l.length > 0)
      .join('\n');
  }

  toStatement(): string {
    return this.build();
  }

  private copy(argsToUpdate: any) {
    return new QueryBuilder(
      argsToUpdate.matchElements ? argsToUpdate.matchElements : [...this.matchElements],
      argsToUpdate.callElement ? argsToUpdate.callElement : this.callElement,
      argsToUpdate.returnElements ? argsToUpdate.returnElements : [...this.returnElements],
      argsToUpdate.order ? argsToUpdate.order : this.order,
      argsToUpdate.whereStatement ? argsToUpdate.whereStatement : this.whereStatement,
      argsToUpdate.skipElements ? argsToUpdate.skipElements : this.skipElements,
      argsToUpdate.limitElements ? argsToUpdate.limitElements : this.limitElements
    );
  }
}

export const match: (...m: Matchable[]) => QueryBuilder = (...m: Matchable[]) => new QueryBuilder().match(...m);
export const optionalMatch: (...m: Matchable[]) => QueryBuilder = (...m: Matchable[]) =>
  new QueryBuilder().optionalMatch(...m);

export const where: (...statement: WhereStatementChain[]) => QueryBuilder = (...statement: WhereStatementChain[]) =>
  new QueryBuilder().where(...statement);

export const callQ: (call: Call) => QueryBuilder = (call: Call) => new QueryBuilder().withCall(call);
