import { Matchable } from './matchable';

export class Match implements Matchable {
  matchables: Matchable[];
  optional: boolean;

  constructor(matchables: Matchable[] = [], optional: boolean = false) {
    this.matchables = matchables;
    this.optional = optional;
  }

  toStatement(): string {
    return (this.optional ? 'OPTIONAL ' : '') + `MATCH ${this.matchables.map((m) => m.toStatement()).join(', ')}`;
  }
}
