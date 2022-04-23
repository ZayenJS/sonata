type TemplateFunctionName = 'range';

class TemplateFunctions {
  private static _instance?: TemplateFunctions;

  private constructor() {}

  public static getInstance() {
    if (!this._instance) {
      this._instance = new TemplateFunctions();
    }

    return this._instance;
  }

  public getAll() {
    return {
      range: this.range,
    };
  }

  public get(name: TemplateFunctionName) {
    return this[name];
  }

  private range(start: number, end?: number, step?: number) {
    const range = [];
    let index = start;

    if (end === undefined) {
      end = start;
      start = 0;
    }

    if (step === undefined) {
      step = start < end ? 1 : -1;
    }

    while (index >= start && index <= end) {
      range.push(index);
      index += step;
    }

    return range;
  }
}

export default TemplateFunctions.getInstance();
