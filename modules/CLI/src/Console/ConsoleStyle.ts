export enum Colors {
  RED = '31',
  GREEN = '32',
  YELLOW = '33',
  BLUE = '34',
  MAGENTA = '35',
  CYAN = '36',
  WHITE = '37',
  BLACK = '30',
  RESET = '\x1b[0m',
}

export enum FontStyle {
  BOLD = '1',
  UNDERLINE = '4',
  ITALIC = '3',
}

export enum Effect {
  BLINKING = '5',
}

class ConsoleStyle {
  constructor(text?: string, style?: string) {}

  private static _(text: string, color?: Colors, fontStyle?: FontStyle, effect?: Effect) {
    let style = [];

    if (fontStyle) {
      style.push(fontStyle);
    }

    if (color) {
      style.push(color);
    }

    if (effect) {
      style.push(effect);
    }

    return '\x1b[' + style.join(';') + text + Colors.RESET;
  }

  public addStyle(
    text?: string,
    params?: { color?: Colors; fontStyle?: FontStyle; effect?: Effect },
  ) {}

  public red = (text?: string) => {
    this.addStyle(text, { color: Colors.RED });

    return this;
  };

  public green = (text?: string) => {
    this.addStyle(text, { color: Colors.GREEN });

    return this;
  };

  public bold = (text?: string) => {
    this.addStyle(text, { fontStyle: FontStyle.BOLD });

    return this;
  };

  public apply = () => {
    let str = '';

    return str;
  };
}

export default new ConsoleStyle();
