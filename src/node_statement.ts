import { GenStatement } from './gen_statement';
import { Matchable } from './matchable';
import { ParamsReplacement } from './params_replacement';

export class NodeStatement implements GenStatement, Matchable {
  name: string;
  labels: string[];
  paramsMatch: ParamsReplacement;

  constructor(name: string = '', labels: string | string[] = [], paramsMatch: ParamsReplacement = []) {
    this.name = name;
    this.labels = Array.isArray(labels) ? labels : [labels];
    this.paramsMatch = paramsMatch;
  }

  private getParamsMatch() {
    if (this.paramsMatch.length === 0) {
      return '';
    }

    const params = this.paramsMatch
      .map((paramMatch) => {
        const propName = paramMatch[0];
        let replacementName = paramMatch[0];
        if (paramMatch.length === 2) {
          replacementName = paramMatch[1];
        }

        return `${propName}: $${replacementName}`;
      })
      .join(', ');

    return `{${params}}`;
  }

  toStatement(): string {
    return `(${this.name}${this.labels.length > 0 ? ':' + this.labels.join(':') : ''}${this.getParamsMatch()})`;
  }
}

export const node: (name?: string, labels?: string | string[], paramsMatch?: ParamsReplacement) => NodeStatement = (
  name: string = '',
  labels: string[] = [],
  paramsMatch: ParamsReplacement = []
) => {
  return new NodeStatement(name, labels, paramsMatch);
};
