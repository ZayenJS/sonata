import { DateFormatter } from './DateFormatter';

export type FilterName = 'upper' | 'lower' | 'capitalize' | 'trim' | 'format';

export class Filter {
  public constructor(
    private readonly name: FilterName,
    private readonly parameters: string[],
  ) {}

  public apply(variable: string): string {
    switch (this.name) {
      case 'upper':
        return `${variable}.toUpperCase()`;
      case 'lower':
        return `${variable}.toLowerCase()`;
      case 'capitalize':
        return `${variable}.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')`;
      case 'trim':
        return `${variable}.trim()`;
      case 'format':
        if (!this.parameters.length) {
          throw new Error('Filter format needs a format string');
        }

        // @ts-ignore
        return DateFormatter.format(variable, this.parameters[0], this.parameters[1]);

      default:
        throw new Error(`Unknown filter: ${this.name}`);
    }
  }
}
