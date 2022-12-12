import { BsCheck, BsCheckAll } from "react-icons/bs";
import { Message } from "../../interfaces/Message";
import { User } from "../../interfaces/User";
import styles from "../../styles/contacts.module.css";

export const renderContactsTick = (msg: Message, currentUser: User | null) => {
  if (msg.from._id === currentUser?._id && msg.read) {
    return (
      <BsCheckAll
        size="17px"
        style={{ transform: "rotate(-10deg) translate(-3px,7px)" }}
        color="#4fc3f7"
      />
    );
  }

  if (msg.from._id === currentUser?._id && !msg.read && msg.secondTick) {
    return (
      <BsCheckAll
        size="17px"
        style={{ transform: "rotate(-10deg) translate(-3px,7px)" }}
        color="rgba(0,0,0,.5)"
      />
    );
  }
  if (msg.from._id === currentUser?._id && !msg.read && !msg.secondTick) {
    return (
      <BsCheck
        size="17px"
        style={{ transform: "rotate(-10deg) translate(-3px,7px)" }}
        color="rgba(0,0,0,.5)"
      />
    );
  }
  if (!msg.read) {
    return <div className={styles.bold_text}></div>;
  }
};
