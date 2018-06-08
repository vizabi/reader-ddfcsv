export const FILE_READING_ERROR = 'File reading error';
export const JSON_PARSING_ERROR = 'JSON parsing error';
export const CSV_PARSING_ERROR = 'CSV parsing error';
export const DDF_ERROR = 'DDF error';

/* tslint: disable-next-line */
export class DdfCsvError extends Error {
  name: string;
  message: string;
  public details: any;
  public file: string | null;
  stack: string;

  constructor(message: string, details, file?: string) {
    super();
    this.name = 'DdfCsvError';
    this.message = `${message} [filepath: ${file}]. ${details}.`;
    this.details = details;
    this.file = file;
  }
}
