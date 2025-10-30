class ApiResponse<T = any> {
  static error(arg0: string): any {
    throw new Error('Method not implemented.');
  }
  statusCode: number;
  data: T | null;
  message: string;
  success: boolean;
  errorMessage: string | null;

  constructor(statusCode: number, data: T | null = null, message: string = '') {
    this.statusCode = statusCode;
    this.data = data;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = this.success ? message : '';
    this.errorMessage = this.success ? null : message;
  }
}

export { ApiResponse };
