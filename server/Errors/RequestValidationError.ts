import { ValidationError } from "express-validator";
import { CustomError } from "./CustomError";

export interface ErrorResult {
  message: string;
  field?: string;
}

export class RequestValidationError extends CustomError {
  statusCode = 401;
  constructor(public errors: ValidationError[]) {
    super("Validation Failed");
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
  serializeErrors = (): ErrorResult[] => {
    return [{ message: this.errors[0].msg, field: this.errors[0].param }];
  };
}
