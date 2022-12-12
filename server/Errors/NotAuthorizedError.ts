import { CustomError } from "./CustomError";
import { ErrorResult } from "./RequestValidationError";

export class NotAuthorizedError extends CustomError {
  statusCode = 401;
  constructor() {
    super("Not Authorized");
  }
  serializeErrors = (): ErrorResult[] => {
    return [{ message: "Not Authorized" }];
  };
}
