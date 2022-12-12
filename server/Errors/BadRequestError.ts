import { CustomError } from "./CustomError";
import { ErrorResult } from "./RequestValidationError";

export class BadRequestError extends CustomError {
  statusCode = 400;
  constructor(public message: string) {
    super("Bad Request");
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors = (): ErrorResult[] => {
    return [{ message: this.message }];
  };
}
