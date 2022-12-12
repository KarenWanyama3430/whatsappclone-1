import { BsCheck, BsCheckAll } from "react-icons/bs";
import { Message } from "../../interfaces/Message";
import { User } from "../../interfaces/User";

interface Props {
  currentContact: User | null;
  currentUser: User | null;
}

export const renderTick = (msg: Message, props: Props): JSX.Element => {
  if (!msg._id) {
    return <span></span>;
  }
  if (
    msg._id &&
    !msg.read &&
    msg.secondTick &&
    msg.to._id.toString() !== props.currentUser?._id.toString() &&
    props.currentContact?._id.toString() === msg.to._id.toString()
  ) {
    // DOUBLE TICK
    return (
      <BsCheckAll
        size="17px"
        style={{ transform: "rotate(-10deg)" }}
        color="rgba(0,0,0,.5)"
      />
    );
  }
  if (
    msg._id &&
    !msg.read &&
    msg.to._id.toString() !== props.currentUser?._id.toString()
  ) {
    // SINGLE TICK
    return (
      <BsCheck
        size="17px"
        style={{ transform: "rotate(-10deg)" }}
        color="rgba(0,0,0,.5)"
      />
    );
  }

  if (
    msg.read &&
    props.currentContact &&
    props.currentContact._id.toString() === msg.to._id.toString()
  ) {
    // BLUE TICK
    return (
      <BsCheckAll
        size="17px"
        style={{ transform: "rotate(-10deg)" }}
        color="#4fc3f7"
      />
    );
  }
  return <span></span>;
};
