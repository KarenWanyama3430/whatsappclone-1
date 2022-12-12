import { NextFunction, Request, Response } from "express";
import { NotAuthorizedError } from "../Errors/NotAuthorizedError";

export interface JWT {
  firstName: string;
  lastName: string;
  email: string;
  _id: string;
}

declare module "express-session" {
  export interface Session {
    user?: JWT;
  }
}

export const auth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session?.isLoggedIn) {
    throw new NotAuthorizedError();
  }
  next();
};
