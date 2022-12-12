import { Request, Response, Router } from "express";
import { check } from "express-validator";
import { NotAuthorizedError } from "../Errors/NotAuthorizedError";
import { auth } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { LastMsg } from "../models/LastMsg";
import { Message } from "../models/Message";
import { socket } from "../socket";
import mongoose from "mongoose";

const route = Router();

route.post(
  "/new/message",
  auth,
  check("to").trim().notEmpty().withMessage("to field cannot be empty"),
  check("message").trim().notEmpty().withMessage("message cannot be empty"),
  check("createdAt")
    .trim()
    .notEmpty()
    .withMessage("createdAt field cannot be empty"),
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { to, message, createdAt } = req.body;
    const newMessage = Message.build({
      from: req.session?.user._id,
      to,
      message,
      chatId: `${req.session!.user._id}${to}`,
      createdAt
    });
    await newMessage.save();
    const msg = await Message.findById(newMessage._id).populate("to from");
    socket.getIO().emit(`message`, {
      action: "create",
      message: msg
    });
    let lastMsgExist;
    lastMsgExist = await LastMsg.findOne({
      chatId: `${req.session!.user._id}${to}`
    }).populate("to from");
    if (!lastMsgExist) {
      lastMsgExist = await LastMsg.findOne({
        chatId: `${to}${req.session!.user._id}`
      }).populate("to from");
    }
    if (lastMsgExist) {
      lastMsgExist.message = message;
      lastMsgExist.from = req.session!.user._id;
      lastMsgExist.to = to;
      lastMsgExist.read = false;
      lastMsgExist.secondTick = false;
      await lastMsgExist.save();
      const count = await Message.countDocuments({
        $or: [
          { chatId: `${req.session!.user._id}${to}` },
          { chatId: `${to}${req.session!.user._id}` }
        ],
        from: req.session!.user._id,
        read: false
      });
      const socketMsg = {
        ...{ ...lastMsgExist.toObject(), from: msg?.from, to: msg?.to },
        count
      };
      socket.getIO().emit(`message`, {
        action: "update",
        message: socketMsg
      });
    } else {
      const newLastMsg = LastMsg.build({
        from: req.session!.user._id,
        to,
        message,
        chatId: `${req.session!.user._id}${to}`
      });
      await newLastMsg.save();
      const newMsg = await LastMsg.findById(newLastMsg._id)
        .lean()
        .populate("to from");
      socket.getIO().emit(`message`, {
        action: "update",
        message: {
          ...newMsg,
          count: 1
        }
      });
    }

    res.send(newMessage);
  }
);

route.post(
  "/messages/:contactId",
  auth,
  check("skip").isNumeric().withMessage("enter messages to be skipped"),
  check("limit").isNumeric().withMessage("enter messages to be limited to"),
  async (req: Request, res: Response): Promise<void> => {
    const { skip, limit } = req.body;
    const messages = await Message.find({
      $or: [
        {
          chatId: `${req.params.contactId}${req.session!.user._id}`
        },
        {
          chatId: `${req.session!.user._id}${req.params.contactId}`
        }
      ]
    })
      .populate("to from")
      .skip(skip)
      .limit(limit);

    if (
      messages.length !== 0 &&
      // @ts-ignore
      messages[0].from._id.toHexString() !== req.session!.user._id.toString() &&
      // @ts-ignore
      messages[0].to._id.toHexString() !== req.session!.user._id.toString()
    ) {
      throw new NotAuthorizedError();
    }
    res.send(messages);
  }
);

route.get(
  "/count/messages/:contactId",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    const messagesCount = await Message.countDocuments({
      $or: [
        {
          chatId: `${req.params.contactId}${req.session!.user._id}`
        },
        {
          chatId: `${req.session!.user._id}${req.params.contactId}`
        }
      ]
    });
    res.send({ count: messagesCount });
  }
);

route.get(
  "/last/msg",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    // from: req.session!.user._id,
    //   to: req.session!.user._id
    const lastMsgs = await LastMsg.find({
      $or: [{ from: req.session!.user._id }, { to: req.session!.user._id }]
    })
      .lean()
      .populate("to from")
      .sort({
        updatedAt: -1
      });
    const msgs = await Promise.all(
      lastMsgs.map(async lmsg => {
        const count = await Message.countDocuments({
          $or: [
            {
              // @ts-ignore
              chatId: `${lmsg.from._id.toHexString()}${lmsg.to._id.toHexString()}`
            },
            {
              // @ts-ignore
              chatId: `${lmsg.to._id.toHexString()}${lmsg.from._id.toHexString()}`
            }
          ],
          to: req.session!.user._id,
          read: false
        });
        return {
          ...lmsg,
          count
        };
      })
    );
    res.send(msgs);
  }
);

route.post(
  "/update/read",
  auth,
  check("msgIds").isArray().withMessage("msgIds must be of type array"),
  check("currentContact")
    .trim()
    .notEmpty()
    .withMessage("currentContact must be of type array"),
  check("currentUser")
    .trim()
    .notEmpty()
    .withMessage("currentUser must be of type array"),
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { msgIds, currentContact, currentUser } = req.body;
    await Message.updateMany(
      { _id: { $in: msgIds } },
      { read: true, readDate: new Date() }
    );
    const updatedMessages = await Message.find({
      _id: { $in: msgIds }
    }).populate("to from");
    socket
      .getIO()
      .emit("read", { action: "change", messages: updatedMessages });
    const updateReadLMsg = await LastMsg.findOneAndUpdate(
      {
        $or: [
          { chatId: `${currentContact}${currentUser}` },
          { chatId: `${currentUser}${currentContact}` }
        ]
      },
      { read: true },
      { new: true }
    ).populate("to from");
    const count = await Message.countDocuments({
      $or: [
        { chatId: `${currentContact}${currentUser}` },
        { chatId: `${currentUser}${currentContact}` }
      ],
      from: req.session!.user._id,
      read: false
    });
    socket.getIO().emit(`message`, {
      action: "update",
      message: {
        ...updateReadLMsg?.toObject(),
        count
      }
    });

    res.send(updatedMessages);
  }
);

route.post(
  "/update/second_tick",
  auth,
  check("msgIds").isArray().withMessage("msgIds must be of type array"),
  check("currentContact")
    .trim()
    .notEmpty()
    .withMessage("currentContact must be of type array"),
  check("currentUser")
    .trim()
    .notEmpty()
    .withMessage("currentUser must be of type array"),
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { msgIds, currentContact, currentUser } = req.body;
    await Message.updateMany(
      { _id: { $in: msgIds } },
      { secondTick: true, deliveredDate: new Date() }
    );
    const updatedMessages = await Message.find({
      _id: { $in: msgIds }
    }).populate("to from");
    socket
      .getIO()
      .emit("secondTick", { action: "change", messages: updatedMessages });
    const updateReadLMsg = await LastMsg.findOneAndUpdate(
      {
        $or: [
          { chatId: `${currentContact}${currentUser}` },
          { chatId: `${currentUser}${currentContact}` }
        ]
      },
      { secondTick: true },
      { new: true }
    ).populate("to from");
    const count = await Message.countDocuments({
      $or: [
        { chatId: `${currentContact}${currentUser}` },
        { chatId: `${currentUser}${currentContact}` }
      ],
      from: req.session!.user._id,
      read: false
    });
    socket.getIO().emit(`message`, {
      action: "update",
      message: {
        ...updateReadLMsg?.toObject(),
        count
      }
    });
    res.send(updatedMessages);
  }
);

route.delete(
  "/delete/message/:messageId",
  auth,
  async (req: Request, res: Response) => {
    const deletedMsg = await Message.findOneAndDelete({
      _id: req.params.messageId,
      from: req.session!.user._id
    });
    if (deletedMsg) {
      socket.getIO().emit(`message`, {
        action: "delete",
        _id: deletedMsg._id
      });
    }
    res.send({ msg: deletedMsg });
  }
);
export { route as messageRoutes };
