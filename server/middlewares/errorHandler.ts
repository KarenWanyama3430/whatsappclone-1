import { NextFunction, Request, Response } from "express";
import { CustomError } from "../Errors/CustomError";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Response => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }
  return res.status(401).send({ errors: [{ message: err.message }] });
};
