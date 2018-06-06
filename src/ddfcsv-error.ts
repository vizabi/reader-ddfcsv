export const FILE_READING_ERROR = 'File reading error';
export const JSON_PARSING_ERROR = 'JSON parsing error';
export const CSV_PARSING_ERROR = 'CSV parsing error';
export const DDF_ERROR = 'DDF error';

export class DdfCsvError extends Error {
  constructor(message: string, public details, public file?: string) {
    super();
    this.name = 'DdfCsvError';
    this.message = `${message} [filepath: ${file}]. ${details}.`;
    this.details = details;
    this.file = file;
  }
}
