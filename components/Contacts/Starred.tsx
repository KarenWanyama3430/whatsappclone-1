import React, { useEffect, useRef, useState } from "react";
import styles from "../../styles/starred.module.css";
import { FiArrowLeft } from "react-icons/fi";
import { AiFillStar } from "react-icons/ai";
import { Message } from "../../interfaces/Message";
import { GroupMsg } from "../../interfaces/GroupMsg";
import { axios } from "../../Axios";
import { formatRelative } from "date-fns";
import { ToggleStarredMsgs, toggleStarredMsgs } from "../../redux/actions";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { Redux } from "../../interfaces/Redux";

interface Props {
  toggleStarredMsgs: (set: boolean) => ToggleStarredMsgs;
}
const Starred: React.FC<Props> = props => {
  const [unstar, setUnstar] = useState<boolean>(false);
  const [messages, setMessages] = useState<{
    starredMessages: Message[];
    starredGrpMessages: GroupMsg[];
  } | null>(null);
  const unstarRef = useRef<HTMLDivElement>(null);

  const starredMsgs = useSelector((state: Redux) => state.user.starredMsgs);
  const currentUserId = useSelector(
    (state: Redux) => state.user.currentUser?._id
  );

  useEffect(() => {
    const fetchStarred = async (): Promise<void> => {
      try {
        const res = await axios.get<typeof messages>("/api/fetch/starred");
        setMessages(res.data);
      } catch (error) {
        console.log(error.response);
      }
    };
    fetchStarred();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (e: MouseEvent) => {
    if (
      unstarRef &&
      unstarRef.current &&
      // @ts-ignore
      !unstarRef.current.contains(e.target)
    ) {
      setUnstar(false);
    }
  };

  return (
    <div
      className={`${styles.container} ${starredMsgs ? styles.starredMsgs : ""}`}
    >
      <div className={styles.header}>
        <div
          className={styles.FiArrowLeft}
          onClick={() => props.toggleStarredMsgs(false)}
        >
          <FiArrowLeft size="25px" />
        </div>
        <p>Starred Messages</p>
        <div className={styles.three_dots_prnt} onClick={() => setUnstar(true)}>
          <div className={styles.three_dots}></div>
          <div className={styles.three_dots}></div>
          <div className={styles.three_dots}></div>
          <div
            className={`${styles.unstar} ${unstar ? styles.unstar__show : ""}`}
            ref={unstarRef}
          >
            <p>Unstar All</p>
          </div>
        </div>
      </div>
      <div className={styles.body}>
        {messages?.starredMessages.length !== 0 &&
          messages?.starredMessages.map(msg => (
            <div className={styles.message} key={msg._id}>
              <div className={styles.msg_header}>
                <img
                  className={styles.profile_img}
                  src={`http://gravatar.com/avatar/${
                    msg.from._id || Math.random()
                  }?d=identicon`}
                  alt=""
                />
                <div className={styles.from_to}>
                  <p>
                    {msg.from._id !== currentUserId
                      ? `${msg.from.firstName} ${msg.from.lastName}`
                      : "You "}
                    &#8594;
                  </p>
                  <p>
                    {msg.to._id !== currentUserId
                      ? ` ${msg.to.firstName} ${msg.to.lastName}`
                      : " You"}
                  </p>
                </div>
                <p className={styles.time}>
                  {formatRelative(new Date(msg.updatedAt!), Date.now())}
                </p>
              </div>
              <div className={styles.msg_body}>
                <p>{msg.message}</p>
                <div className={styles.msg_time}>
                  <AiFillStar />
                  <p>{formatRelative(new Date(msg.updatedAt!), Date.now())}</p>
                </div>
              </div>
            </div>
          ))}
        {messages?.starredGrpMessages.length !== 0 &&
          messages?.starredGrpMessages.map(msg => (
            <div className={styles.message} key={msg._id}>
              <div className={styles.msg_header}>
                <img
                  className={styles.profile_img}
                  src={`http://gravatar.com/avatar/${
                    msg.from._id || Math.random()
                  }?d=identicon`}
                  alt=""
                />
                <div className={styles.from_to}>
                  <p>
                    {msg.from._id !== currentUserId
                      ? `${msg.from.firstName} ${msg.from.lastName} `
                      : "You "}
                    &#8594;
                  </p>
                  <p> {msg.group.name}</p>
                </div>
                <p className={styles.time}>
                  {formatRelative(new Date(msg.updatedAt!), Date.now())}
                </p>
              </div>
              <div className={styles.msg_body}>
                <p>{msg.message}</p>
                <div className={styles.msg_time}>
                  <AiFillStar />
                  <p>{formatRelative(new Date(msg.updatedAt!), Date.now())}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators({ toggleStarredMsgs }, dispatch)
)(Starred);
