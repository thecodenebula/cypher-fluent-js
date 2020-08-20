import { GenStatement } from './gen_statement';
import { Matchable } from './matchable';
import { NodeStatement } from './node_statement';

export type RelationshipComponent = NodeStatement | RelationshipStatement;

enum RelationshipDirection {
  LR,
  RL,
  ANY,
}

export class RelationshipStatement implements GenStatement, Matchable {
  left: RelationshipComponent;
  right: RelationshipComponent;
  direction: RelationshipDirection;
  name?: string;
  type?: string;

  constructor(
    left: RelationshipComponent,
    right: RelationshipComponent,
    name: string = '',
    type: string = '',
    direction: RelationshipDirection = RelationshipDirection.ANY
  ) {
    this.left = left;
    this.right = right;
    this.type = type;
    this.name = name;
    this.direction = direction;
  }

  private getRelationshipStatement() {
    let inBetweenLabel = '';
    if (this.name && this.type) {
      inBetweenLabel = `[${this.name}: ${this.type}]`;
    } else if (this.name) {
      inBetweenLabel = `[${this.name}]`;
    } else if (this.type) {
      inBetweenLabel = `[:${this.type}]`;
    }
    switch (this.direction) {
      case RelationshipDirection.ANY:
        return `-${inBetweenLabel}-`;
      case RelationshipDirection.LR:
        return `-${inBetweenLabel}->`;
      case RelationshipDirection.RL:
        return `<-${inBetweenLabel}-`;
      default:
        throw new Error(`${this.direction} is not a known relationship direction`);
    }
  }

  withType(type: string): RelationshipStatement {
    return new RelationshipStatement(this.left, this.right, this.name, type, this.direction);
  }

  withName(name: string): RelationshipStatement {
    return new RelationshipStatement(this.left, this.right, name, this.type, this.direction);
  }

  lr(): RelationshipStatement {
    return new RelationshipStatement(this.left, this.right, this.name, this.type, RelationshipDirection.LR);
  }
  rl(): RelationshipStatement {
    return new RelationshipStatement(this.left, this.right, this.name, this.type, RelationshipDirection.RL);
  }
  any(): RelationshipStatement {
    return new RelationshipStatement(this.left, this.right, this.name, this.type, RelationshipDirection.ANY);
  }

  toStatement(): string {
    return `${this.left.toStatement()}${this.getRelationshipStatement()}${this.right.toStatement()}`;
  }
}

export const relationship: (
  left: RelationshipComponent,
  right: RelationshipComponent,
  name?: string,
  type?: string,
  direction?: RelationshipDirection
) => any = (
  left: RelationshipComponent,
  right: RelationshipComponent,
  name: string | undefined = undefined,
  type: string | undefined = undefined,
  direction: RelationshipDirection = RelationshipDirection.ANY
) => new RelationshipStatement(left, right, name, type, direction);
