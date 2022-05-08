import Enquirer from 'enquirer';
import chalk from 'chalk';
import { File } from './File';

export class Controllerfile extends File {
  protected getData = (name: string = this.name) =>
    this.parse([
      this.addLine(0, `import { Route, Response } from '@sonata/common';`),
      this.addLine(0, ''),
      this.addLine(0, `export class ${name} {`),
      this.addLine(1, `@Route('/${name.split(/controller/i)[0].toLowerCase()}')`),
      this.addLine(1, `public async index(response: Response) {`),
      this.addLine(
        2,
        `return response.render('${name.split(/controller/i)[0].toLowerCase()}/index');`,
      ),
      this.addLine(1, `}`),
      this.addLine(0, `}`),
    ]);

  public generate = async (): Promise<boolean> => {
    // TODO: Generate file and check if it already exist before creating it
    const fileExists = false;

    if (fileExists) {
      this.error(
        `[ERROR] The file "src/Controller/${this.name}.ts" can't be generated because it already exists.`,
      );
      process.exit(1);
    }

    if (!this.name) {
      const answer: { name: string } = await Enquirer.prompt({
        type: 'input',
        name: 'name',
        message: `${chalk.green('Choose a name for your controller class (')}${chalk.yellow(
          'e.g. UserController',
        )}${chalk.green(')')}:\n>`,
      });

      this.name = answer.name;
    }

    // console.log(this.getData());

    this.success(
      [
        `src/Controller/${this.name}.ts`,
        `views/${this.name.split(/controller/i)[0].toLowerCase()}/index.sonata`,
      ],
      'Next: Open your new controller class and add some pages!',
    );

    return true;
  };
}
