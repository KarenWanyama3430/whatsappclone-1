import { Request, Response, Router } from "express";
import { check } from "express-validator";
import { NotAuthorizedError } from "../Errors/NotAuthorizedError";
import { auth, JWT } from "../middlewares/auth";
import { validateRequest } from "../middlewares/validateRequest";
import { Group } from "../models/Group";
import { GroupMsg } from "../models/GroupMsg";
import { User } from "../models/User";
import { socket } from "../socket";
import mongoose from "mongoose";

const route = Router();
declare module "express" {
  export interface Session {
    user?: JWT;
  }
}
route.post(
  "/new/group",
  auth,
  check("name").trim().notEmpty().withMessage("name must be provided"),
  check("participants")
    .isArray({ min: 1 })
    .withMessage("participants cannot be empty"),
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { name, participants } = req.body;
    const group = Group.build({
      admin: req.session!.user._id,
      name,
      participants: [req.session!.user._id, ...participants]
    });
    await group.save();
    const populatedGroup = await Group.findById(group._id).populate(
      "participants",
      "firstName lastName"
    );
    socket.getIO().emit("group", { action: "create", group: populatedGroup });
    await User.updateMany(
      { _id: { $in: [...participants, req.session!.user._id] } },
      { $push: { groups: group._id } }
    );
    res.send(group);
  }
);
route.post(
  "/new/group/message",
  auth,
  check("group").trim().notEmpty().withMessage("group id must be provided"),
  check("message").trim().notEmpty().withMessage("message must be provided"),
  check("createdAt")
    .trim()
    .notEmpty()
    .withMessage("created at must be provided"),
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { group, message, createdAt } = req.body;
    const groupMsg = GroupMsg.build({
      from: req.session!.user._id,
      group,
      message,
      createdAt,
      readBy: [
        {
          user: req.session!.user._id,
          readDate: new Date()
        }
      ]
    });
    await groupMsg.save();
    const currentGroup = await Group.findById(group).populate([
      { path: "participants", select: "firstName lastName" },
      { path: "lastMessage" }
    ]);
    currentGroup!.lastMessage = groupMsg._id;
    await currentGroup?.save();
    socket.getIO().emit(`${group}`, {
      action: "update",
      message: { ...currentGroup?.toObject(), lastMessage: groupMsg }
    });
    const populatedMsg = await GroupMsg.findById(groupMsg._id).populate([
      { path: "from" },
      { path: "group" },
      { path: "readBy.user", select: "firstName lastName" },
      { path: "deliveredTo.user", select: "firstName lastName" }
    ]);

    socket.getIO().emit(`${group}`, {
      action: "create",
      message: populatedMsg
    });
    res.send(populatedMsg);
  }
);

route.get(
  "/all/groups",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    const groups = await Group.find({
      participants: req.session!.user._id
    }).populate([
      { path: "participants", select: "firstName lastName" },
      { path: "lastMessage" }
    ]);
    const grps = await Promise.all(
      groups.map(async grp => {
        const count = await GroupMsg.countDocuments({
          group: grp._id,
          "readBy.user": { $ne: req.session!.user._id },
          from: { $ne: req.session!.user._id }
        });
        return { ...grp.toObject(), count };
      })
    );
    res.send(grps);
  }
);

route.post(
  "/group/messages/:groupId",
  auth,
  check("skip").isNumeric().withMessage("enter messages to be skipped"),
  check("limit").isNumeric().withMessage("enter messages to be limited to"),
  async (req: Request, res: Response): Promise<void> => {
    const { groupId } = req.params;
    const { skip, limit } = req.body;
    const user = await User.findById(req.session!.user._id);
    const groupNotFound =
      !user?.groups ||
      !user.groups.find(grp => grp.toString() === groupId.toString());
    if (groupNotFound) {
      throw new NotAuthorizedError();
    }
    const messages = await GroupMsg.find({ group: groupId })
      .populate([
        { path: "from" },
        { path: "group" },
        { path: "readBy.user", select: "firstName lastName" },
        { path: "deliveredTo.user", select: "firstName lastName" }
      ])
      .skip(skip)
      .limit(limit);

    res.send(messages);
  }
);

route.get(
  "/count/group/messages/:groupId",
  async (req: Request, res: Response): Promise<void> => {
    const grpMsgCount = await GroupMsg.countDocuments({
      group: req.params.groupId
    });
    res.send({ count: grpMsgCount });
  }
);

route.post(
  "/update/group/messages/read",
  auth,
  check("messageIds")
    .isArray({ min: 1 })
    .withMessage("message ids must be provided"),
  check("readBy").trim().notEmpty().withMessage("read by must be provided"),
  validateRequest,
  async (req: Request, res: Response): Promise<void> => {
    const { messageIds, readBy } = req.body;
    await GroupMsg.updateMany(
      { _id: { $in: messageIds }, "readBy.user": { $ne: readBy } },
      { read: true, $push: { readBy: { user: readBy, readDate: new Date() } } }
    );
    const updatedMsgs = await GroupMsg.find({
      _id: { $in: messageIds }
    }).populate([
      { path: "from" },
      { path: "group" },
      { path: "readBy.user", select: "firstName lastName" },
      { path: "deliveredTo.user", select: "firstName lastName" }
    ]);
    socket
      .getIO()
      .emit("groupread", { action: "change", groupMsgs: updatedMsgs });
    res.send(updatedMsgs);
  }
);
route.get(
  "/update/group/messages/delivered",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    const userGroups = await Group.find({
      participants: req.session!.user._id
    }).select("_id");
    const userGroupIds = userGroups.map(gr => gr._id);
    if (userGroups.length !== 0) {
      const deliveredDate = new Date();
      await GroupMsg.updateMany(
        {
          group: { $in: userGroupIds },
          "deliveredTo.user": { $ne: req.session!.user._id },
          from: { $ne: req.session!.user._id }
        },
        {
          $push: {
            deliveredTo: {
              user: req.session!.user._id,
              deliveredDate
            }
          }
        }
      );
      const { _id, firstName, lastName } = req.session!.user;
      socket.getIO().emit("groupdelivered", {
        action: "change",
        user: { _id, firstName, lastName, deliveredDate }
      });
      res.send({ _id, firstName, lastName });
      return;
    }
    res.send([]);
  }
);

route.post(
  "/update/group/description/:groupId",
  auth,
  check("description")
    .trim()
    .notEmpty()
    .withMessage("description cannot be empty"),
  async (req: Request, res: Response) => {
    const { description } = req.body;
    const grp = await Group.findByIdAndUpdate(
      req.params.groupId,
      { description },
      { new: true }
    ).populate("participants", "firstName lastName");
    if (grp) {
      socket.getIO().emit("group", {
        action: "description",
        group: grp
      });
    }
    res.send(grp);
  }
);

route.delete(
  "/delete/group/message/:messageId",
  auth,
  async (req: Request, res: Response): Promise<void> => {
    const deletedMsg = await GroupMsg.findOneAndDelete({
      _id: req.params.messageId,
      from: req.session!.user._id
    });
    if (deletedMsg) {
      socket
        .getIO()
        .emit("groupMsg", { action: "delete", _id: deletedMsg._id });
    }
    res.send({ msg: deletedMsg });
  }
);

route.get(
  "/leave/group/:groupId",
  auth,
  async (req: Request, res: Response) => {
    const user = await User.findByIdAndUpdate(
      req.session!.user._id,
      {
        // @ts-ignore
        $pull: { groups: { $in: [req.params.groupId] } }
      },
      { new: true }
    );
    const group = await Group.findByIdAndUpdate(
      req.params.groupId,
      { $pull: { participants: req.session!.user._id } },
      { new: true }
    );
    res.send({ user, group });
  }
);

export { route as groupRoutes };
