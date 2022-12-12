import { CustomError } from "./CustomError";
import { ErrorResult } from "./RequestValidationError";

export class DatabaseConnectionError extends CustomError {
  statusCode = 500;
  constructor() {
    super("Error connecting to the database");
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }
  serializeErrors = (): ErrorResult[] => {
    return [{ message: "Error connecting to the database" }];
  };
}
