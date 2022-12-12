import mongoose from "mongoose";

interface UserArrs {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profilePhoto?: string;
  status?: string;
  online?: boolean;
  typing?: boolean;
  lastSeen?: Date;
  groups?: mongoose.Types.ObjectId[];
  starredMessages?: mongoose.Types.ObjectId[];
  starredGrpMessages?: mongoose.Types.ObjectId[];
}

interface UserDoc extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profilePhoto?: string;
  status?: string;
  online?: boolean;
  typing?: boolean;
  lastSeen?: Date;
  groups?: mongoose.Types.ObjectId[];
  starredMessages?: mongoose.Types.ObjectId[];
  starredGrpMessages?: mongoose.Types.ObjectId[];
}

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserArrs): UserDoc;
}

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePhoto: {
      type: String
    },
    status: {
      type: String,
      default: "Hey there I'm using whatsapp"
    },
    online: {
      type: Boolean,
      default: false
    },
    typing: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date
    },
    groups: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Group"
      }
    ],
    starredMessages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Message"
      }
    ],
    starredGrpMessages: [
      {
        type: mongoose.Types.ObjectId,
        ref: "GroupMsg"
      }
    ]
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc: UserDoc, ret): void {
        delete ret.password;
        return ret;
      }
    }
  }
);

UserSchema.statics.build = (attrs: UserArrs): UserDoc => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", UserSchema);

export { User };
