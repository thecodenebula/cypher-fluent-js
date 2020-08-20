import { Raw } from './raw';
import { Variable } from './variable';
import { Value } from './value';
import { Callable } from './callable';

type ArgsType = Raw | Value<any> | Variable;

export class Call implements Callable {
  private readonly thingToCall: Raw | string;
  private readonly arguments: ArgsType[];
  private readonly yields: (Raw | string)[];

  constructor(thingToCall: Raw | string, args: ArgsType[] = [], yields: (Raw | string)[] = []) {
    this.thingToCall = thingToCall;
    this.arguments = args;
    this.yields = yields;
  }

  yield(...y: (Raw | string)[]) {
    return new Call(this.thingToCall, [...this.arguments], [...this.yields, ...y]);
  }

  args(...args: ArgsType[]) {
    return new Call(this.thingToCall, [...this.arguments, ...args], [...this.yields]);
  }

  toStatement(): string {
    return `CALL ${typeof this.thingToCall === 'string' ? this.thingToCall : this.thingToCall.toStatement()}${
      this.args.length > 0 ? ` (${this.arguments.map((arg) => arg.toStatement()).join(', ')})` : ''
    }${
      this.yields.length > 0
        ? ` YIELD ${this.yields.map((y) => (typeof y === 'string' ? y : y.toStatement())).join(', ')}`
        : ''
    }`;
  }
}

export const call: (thingToCall: Raw | string, args?: ArgsType[], yields?: (Raw | string)[]) => Call = (
  thingToCall: Raw | string,
  args: ArgsType[],
  yields: (Raw | string)[]
) => new Call(thingToCall, args, yields);
