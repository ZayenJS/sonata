export class DateFormatter {
  public static format(
    date: Date,
    locale: string,
    format: Intl.DateTimeFormatOptions,
  ): string {
    return `new Intl.DateTimeFormat(${locale}, {${format}}).format(${date})`;
  }
}
