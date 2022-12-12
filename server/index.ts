import mongoose from "mongoose";
import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import "express-async-errors";
import { NotFound } from "./Errors/NotFound";
import { errorHandler } from "./middlewares/errorHandler";
import { userRoutes } from "./routes/userRoutes";
import cors from "cors";
import session from "express-session";
import store from "connect-mongodb-session";
import next from "next";
import { messageRoutes } from "./routes/messageRoutes";
import socketio, { Socket } from "socket.io";
import { socket } from "./socket";
import { User } from "../interfaces/User";
import url from "url";
import { groupRoutes } from "./routes/groupRoutes";

const PORT = process.env.PORT || 3000;
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // if (process.env.NODE_ENV === "development") {
  //   server.use(
  //     cors({
  //       origin: "http://localhost:3000",
  //       optionsSuccessStatus: 200
  //     })
  //   );
  // }
  if (process.env.NODE_ENV !== "development") {
    server.all("*", (req: Request, res: Response, next: NextFunction) => {
      if (req.protocol === "http") {
        const httpsUrl = url.format({
          protocol: "https",
          host: req.get("host"),
          pathname: req.originalUrl
        });
        return res.redirect(301, httpsUrl);
      }
      next();
    });
  }
  server.use(bodyParser.json());
  server.use(bodyParser.urlencoded({ extended: true }));

  const MongoStore = store(session);

  const sessionStore = new MongoStore({
    uri: process.env.MONGO_URI as string,
    collection: "sessions"
  });
  server.set("trust proxy", 1);
  server.use(
    session({
      secret: process.env.COOKIE_SECRET as string,
      saveUninitialized: false,
      resave: false,
      store: sessionStore,
      cookie: {
        sameSite: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: process.env.NODE_ENV === "production"
      }
    })
  );

  server.use("/api", userRoutes);
  server.use("/api", messageRoutes);
  server.use("/api", groupRoutes);

  // NOT FOUND ROUTE
  server.all(
    "/api",
    async (): Promise<void> => {
      throw new NotFound();
    }
  );

  server.use(errorHandler);
  server.all("*", (req, res) => handle(req, res));

  const connectMongo = async (): Promise<void> => {
    try {
      if (!process.env.MONGO_URI) {
        throw new Error("Mongo URI Must be provided");
      }
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true
      });
      console.log("Connected to db");
      const ioServer = server.listen(PORT, () =>
        console.log(`Server started on port ${PORT} `)
      );

      const io = socket.init(ioServer);
      io.on("connection", (socket: Socket) => {
        console.log("Client Connected");

        io.allSockets().then(count =>
          console.log("connectedClients", count.size)
        );
        socket.on("typing", (data: { action: string; user: User }) => {
          if (data.action === "change") {
            socket.broadcast.emit("typing", {
              action: "change",
              user: data.user
            });
          }
        });
        socket.on("active", (data: { action: string; user: User }) => {
          if (data.action === "change") {
            socket.broadcast.emit("active", {
              action: "change",
              user: data.user
            });
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  connectMongo();
});
