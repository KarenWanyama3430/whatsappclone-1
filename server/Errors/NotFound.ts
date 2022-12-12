import { CustomError } from "./CustomError";
import { ErrorResult } from "./RequestValidationError";

export class NotFound extends CustomError {
  statusCode = 404;
  constructor() {
    super("Not Found");
  }
  serializeErrors = (): ErrorResult[] => {
    return [{ message: "Not Found" }];
  };
}
