import { Request, Response, Router } from "express";
import { check } from "express-validator";
import { BadRequestError } from "../Errors/BadRequestError";
import { validateRequest } from "../middlewares/validateRequest";
import bcrypt from "bcrypt";
import { User } from "../models/User";
import { auth, JWT } from "../middlewares/auth";
import { NotAuthorizedError } from "../Errors/NotAuthorizedError";
import { socket } from "../socket";
import mongoose from "mongoose";

const route = Router();

route.get(
  "/currentUser",
  async (req: Request, res: Response): Promise<void> => {
    console.log("reached");
    if (!req.session?.user) {
      res.send({ currentUser: null });
      return;
    }
    const user = await User.findById(req.session.user._id);
    res.send({ currentUser: user });
  }
);

route.post(
  "/register",
  check("firstName").trim().notEmpty().withMessage("first name is required"),
  check("lastName").trim().notEmpty().withMessage("last name is required"),
  check("email").trim().isEmail().withMessage("enter a valid email"),
  check("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("password must be six characters minimum"),
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    } = req.body as { [key: string]: string };
    if (email.includes("test")) {
      throw new BadRequestError("A user with that email already exists");
    }
    if (password !== confirmPassword) {
      throw new BadRequestError("passwords do not match");
    }
    const userExist = await User.findOne({ email: email.toLowerCase() });
    if (userExist) {
      throw new BadRequestError("A user with that email already exists");
    }
    const hashedPassword = await bcrypt.hash(password.trim(), 8);

    const user = User.build({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword
    });
    await user.save();
    res.status(201).send(user);
  }
);

route.post(
  "/login",
  check("email").trim().isEmail().withMessage("please enter a valid email"),
  check("password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("password must be six characters minimum"),
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as { [key: string]: string };
    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    if (!isMatch) {
      throw new BadRequestError("Invalid email or password");
    }

    req.session!.user = user;
    req.session!.isLoggedIn = true;
    socket.getIO().emit("contacts", { action: "create", contact: user });
    res.send(user);
  }
);

route.get(
  "/all/contacts",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    const contacts = await User.find({
      _id: { $nin: [req.session?.user._id] }
    }).sort({ createdAt: -1 });
    res.send(contacts);
  }
);

route.post("/update/user", auth, async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email || password) {
    throw new NotAuthorizedError();
  }
  const user = await User.findByIdAndUpdate(req.session!.user._id, req.body);

  res.send(user);
});
route.post(
  "/update/user/profile",
  auth,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (email || password) {
      throw new NotAuthorizedError();
    }
    const user = await User.findByIdAndUpdate(req.session!.user._id, req.body);

    res.send(user);
  }
);

route.get(
  "/contact/:contactId",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    const contact = await User.findById(req.params.contactId);
    res.send(contact);
  }
);

route.post(
  "/star/message",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    const { starredMessage, starredGrpMessage } = req.body as {
      starredMessage?: string[];
      starredGrpMessage?: string[];
    };
    if (
      (!starredMessage ||
        (starredMessage && !Array.isArray(starredMessage)) ||
        (starredMessage && starredMessage.length === 0)) &&
      (!starredGrpMessage ||
        (starredGrpMessage && !Array.isArray(starredGrpMessage)) ||
        (starredGrpMessage && starredGrpMessage.length === 0))
    ) {
      throw new BadRequestError("provide msg ID");
    }
    if (starredMessage) {
      const user = await User.findByIdAndUpdate(
        req.session!.user._id,
        {
          $push: {
            starredMessages: {
              $each: (starredMessage as unknown) as mongoose.Types.ObjectId[]
            }
          }
        },
        { new: true }
      );
      res.send(user);
    }
    if (starredGrpMessage) {
      const user = await User.findByIdAndUpdate(
        req.session!.user._id,
        {
          $push: {
            starredGrpMessages: {
              $each: (starredGrpMessage as unknown) as mongoose.Types.ObjectId[]
            }
          }
        },
        { new: true }
      );
      res.send(user);
    }
  }
);
route.post(
  "/unstar/message",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    const { starredMessage, starredGrpMessage } = req.body as {
      starredMessage?: string;
      starredGrpMessage?: string;
    };
    if (
      (!starredMessage ||
        (starredMessage && starredMessage.trim().length === 0)) &&
      (!starredGrpMessage ||
        (starredGrpMessage && starredGrpMessage.trim().length === 0))
    ) {
      throw new BadRequestError("provide msg ID");
    }
    if (starredMessage) {
      const user = await User.findByIdAndUpdate(
        req.session!.user._id,
        {
          $pull: {
            starredMessages: (starredMessage as unknown) as mongoose.Types.ObjectId
          }
        },
        { new: true }
      );
      res.send(user);
    }

    if (starredGrpMessage) {
      const user = await User.findByIdAndUpdate(
        req.session!.user._id,
        {
          $pull: {
            starredGrpMessages: (starredGrpMessage as unknown) as mongoose.Types.ObjectId
          }
        },
        { new: true }
      );
      res.send(user);
    }
  }
);

route.get(
  "/unstar/all/messages",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    const user = User.findByIdAndUpdate(
      req.session!.user._id,
      { starredGrpMessages: [], starredMessages: [] },
      { new: true }
    );
    res.send(user);
  }
);

route.get(
  "/fetch/starred",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    const msgs = await User.findById(req.session!.user._id)
      .select({ starredMessages: 1, starredGrpMessages: 1, _id: 0 })
      .populate([
        {
          path: "starredMessages",
          populate: {
            path: "to from",
            select: "firstName lastName"
          }
        },
        {
          path: "starredGrpMessages",
          populate: [
            {
              path: "from",
              select: "firstName lastName"
            },
            {
              path: "group",
              select: "name"
            }
          ]
        }
      ]);
    res.send(msgs);
  }
);

route.get(
  "/logout",
  async (req: Request, res: Response): Promise<void> => {
    req.session?.destroy(err => {
      if (err) {
        throw new NotAuthorizedError();
      }
    });
    res.redirect("/login");
  }
);

export { route as userRoutes };
