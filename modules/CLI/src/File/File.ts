import chalk from 'chalk';

export abstract class File {
  constructor(protected name: string) {}

  protected addLine = (tabs = 0, str: string | null = null) => {
    if (str === null) {
      return null;
    }

    return str ? '\t'.repeat(tabs) + str : '';
  };

  protected parse = (collection: unknown[]) =>
    collection.filter(line => typeof line === 'string').join('\n');

  protected abstract getData(name: string): void;
  public abstract generate: () => Promise<boolean>;

  protected success = (createdFilesPaths: string[], message: string) => {
    console.info();
    for (const path of createdFilesPaths) {
      console.info(` ${chalk.blue('created')}: ${path}`);
    }
    console.info();
    console.info(` ${chalk.bgGreen('          ')}`);
    console.info(` ${chalk.bgGreen(' Success! ')}`);
    console.info(` ${chalk.bgGreen('          ')}`);
    console.info();
    console.info(` ${message}`);
  };

  protected error = (message: string) => {
    const LINE_LENGTH = 120;

    console.error();
    console.error(chalk.bgRed(' '.repeat(LINE_LENGTH)));
    console.error(chalk.bgRed(` ${message}${' '.repeat(LINE_LENGTH - 1 - message.length)}`));
    console.error(chalk.bgRed(' '.repeat(LINE_LENGTH)));
    console.error();
  };
}
