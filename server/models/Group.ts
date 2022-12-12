import mongoose from "mongoose";

interface GroupAttrs {
  name: string;
  participants: mongoose.Types.ObjectId[];
  admin: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  description?: string;
}

interface GroupDoc extends mongoose.Document {
  name: string;
  participants: mongoose.Types.ObjectId[];
  admin: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  description?: string;
}

interface GroupModel extends mongoose.Model<GroupDoc> {
  build: (attrs: GroupAttrs) => GroupDoc;
}

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    participants: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    admin: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    lastMessage: {
      type: mongoose.Types.ObjectId,
      ref: "GroupMsg"
    },
    description: {
      type: String
    }
  },
  { timestamps: true }
);

GroupSchema.statics.build = (groupAttrs: GroupAttrs): GroupDoc => {
  return new Group(groupAttrs);
};

const Group = mongoose.model<GroupDoc, GroupModel>("Group", GroupSchema);

export { Group };
