import enquirer from 'enquirer';
import { Command } from 'commander';
import { Controllerfile } from '../File/ControllerFile';

class CLIConsole extends Command {
  private makeCommands = {
    controller: {
      alias: 'm:c',
      command: 'make:controller',
      description: 'Create a new controller',
      arguments: [
        {
          name: '[name]',
          description: 'The name of the controller',
          default: null,
        },
      ],
      options: [],
      action: this._makeController,
    },
    entity: {
      alias: 'm:c',
      command: 'make:entity',
      description: 'Create a new entity',
      arguments: [
        {
          name: '[name]',
          description: 'The name of the entity',
          default: null,
        },
      ],
      options: [],
      action: this._makeEntity,
    },
  };

  public constructor() {
    super();
    this.version('0.0.1');

    for (const key in this.makeCommands) {
      //@ts-ignore
      const command = this.makeCommands[key];
      this.command(command.command)
        .alias(command.alias)
        .description(command.description)
        .action(command.action);

      const registeredCommand = this.commands.find(c => c.name() === command.command);

      if (registeredCommand) {
        for (const argument of command.arguments) {
          registeredCommand.argument(argument.name, argument.description, argument.default);
        }

        for (const option of command.options) {
          registeredCommand.option(option.name, option.description);
        }
      }
    }
  }

  private _makeController(
    controllerName: unknown,
    options: { [key: string]: any },
    command: Command,
  ) {
    // console.log({ controllerName, options, command });

    const controllerFile = new Controllerfile(controllerName as string);
    controllerFile.generate();
  }

  private _makeEntity(entityName: unknown, options: { [key: string]: any }, command: Command) {
    console.log('Create a new entity');

    console.log({ entityName, options, command });
  }
}

const cliConsole = new CLIConsole();
cliConsole.parse(process.argv);

export default cliConsole;
