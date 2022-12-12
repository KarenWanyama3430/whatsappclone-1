import { formatDistance } from "date-fns";
import React, { useEffect, useRef } from "react";
import { AiFillStar } from "react-icons/ai";
import { BiCheck } from "react-icons/bi";
import { useSelector } from "react-redux";
import { GroupMsg } from "../../interfaces/GroupMsg";
import { Redux } from "../../interfaces/Redux";
import { User } from "../../interfaces/User";
import styles from "../../styles/groupChat.module.css";
import RenderTick from "./RenderTick";
let ScrollIntoViewIfNeeded: any;
if (typeof window !== "undefined") {
  ScrollIntoViewIfNeeded = React.lazy(
    () => import("react-scroll-into-view-if-needed")
  );
}

interface Props {
  groupMessages: GroupMsg[] | null;
  grpScrollMsg: GroupMsg | null;
  currentUser: User | null;
  selectedMessages: string[];
  setSelectedMessages: React.Dispatch<React.SetStateAction<string[]>>;
  active: boolean;
  selectGroupMessages: boolean;
}

const GroupMessages: React.FC<Props> = props => {
  const currentGroup = useSelector((state: Redux) => state.group.currentGroup);
  const scrollToElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.grpScrollMsg && scrollToElementRef.current) {
      scrollToElementRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [props.grpScrollMsg]);

  const genColor = (userId: string) => {
    const stringArr = userId.split("");
    const first = stringArr[stringArr.length - 1];
    const second = stringArr[stringArr.length - 2];
    const third = stringArr[stringArr.length - 3];
    return { first, second, third };
  };

  const {
    groupMessages,
    currentUser,
    grpScrollMsg,
    selectedMessages,
    setSelectedMessages,
    active,
    selectGroupMessages
  } = props;
  return (
    <React.Fragment>
      {groupMessages &&
        groupMessages?.length !== 0 &&
        (groupMessages as GroupMsg[]).map(msg =>
          msg.from._id.toString() === currentUser?._id.toString() ? (
            <span
              className={`${
                msg._id && selectedMessages.indexOf(msg._id) !== -1
                  ? styles.checked
                  : ""
              }`}
              key={msg.createdAt}
            >
              {grpScrollMsg && grpScrollMsg._id === msg._id && (
                <div ref={scrollToElementRef}></div>
              )}
              <label
                htmlFor={msg.createdAt}
                className={`${styles.right_text} `}
                key={msg.createdAt}
              >
                <div>
                  <div className={styles.BiCheck}>
                    <BiCheck
                      size="25px"
                      className={styles.check}
                      color="white"
                    />
                    <div className={styles.check_label}>&nbsp;</div>
                  </div>
                  <input
                    type="checkbox"
                    id={msg.createdAt}
                    name={msg.createdAt}
                    checked={!!selectedMessages.find(ms => ms === msg._id)}
                    onChange={() => {
                      if (selectGroupMessages && msg._id) {
                        const selectedMsgs = [...selectedMessages];
                        const msgIndx = selectedMsgs.indexOf(msg._id);
                        if (msgIndx !== -1) {
                          selectedMsgs.splice(msgIndx, 1);
                          setSelectedMessages(selectedMsgs);
                        } else {
                          setSelectedMessages([msg._id, ...selectedMessages]);
                        }
                      }
                    }}
                  />
                </div>
                <div
                  className={`${styles.message} ${
                    grpScrollMsg && grpScrollMsg._id === msg._id
                      ? styles.grpScrollMsg
                      : ""
                  }`}
                >
                  <p>{msg.message}</p>
                  <p className={styles.date}>
                    {msg._id &&
                      currentUser?.starredGrpMessages.includes(msg._id) && (
                        <AiFillStar
                          color="rgba(0,0,0,.5)"
                          style={{
                            transform: "translateY(2px)"
                          }}
                        />
                      )}
                    <span>
                      {formatDistance(new Date(msg.createdAt), Date.now())}
                    </span>
                    <span>
                      <RenderTick grpMsg={msg} currentGroup={currentGroup} />
                    </span>
                  </p>
                </div>
              </label>
            </span>
          ) : (
            <span
              className={`${
                msg._id && selectedMessages.indexOf(msg._id) !== -1
                  ? styles.checked
                  : ""
              }`}
              key={msg.createdAt}
            >
              {" "}
              {grpScrollMsg && grpScrollMsg._id === msg._id && (
                <div ref={scrollToElementRef}></div>
              )}
              <label
                htmlFor={msg.createdAt}
                className={`${styles.left_text}  `}
              >
                {" "}
                <div>
                  {" "}
                  <div className={styles.BiCheck}>
                    <BiCheck
                      size="25px"
                      className={styles.check}
                      color="white"
                    />
                    <div className={styles.check_label}>&nbsp;</div>
                  </div>
                  <input
                    type="checkbox"
                    id={msg.createdAt}
                    name={msg.createdAt}
                    checked={!!selectedMessages.find(ms => ms === msg._id)}
                    onChange={() => {
                      if (selectGroupMessages && msg._id) {
                        const selectedMsgs = [...selectedMessages];
                        const msgIndx = selectedMsgs.indexOf(msg._id);
                        if (msgIndx !== -1) {
                          selectedMsgs.splice(msgIndx, 1);
                          setSelectedMessages(selectedMsgs);
                        } else {
                          setSelectedMessages([msg._id, ...selectedMessages]);
                        }
                      }
                    }}
                  />
                </div>
                <div
                  className={`${styles.message} ${
                    grpScrollMsg && grpScrollMsg._id === msg._id
                      ? styles.grpScrollMsg
                      : ""
                  }`}
                >
                  <p
                    className={styles.name}
                    style={{
                      color: `#${genColor(msg.from._id || "0").first}${
                        genColor(msg.from._id || "0").second
                      }${genColor(msg.from._id || "0").third}
                      `
                    }}
                  >
                    {msg.from.firstName} {msg.from.lastName}
                  </p>
                  <p>{msg.message}</p>{" "}
                  <p className={styles.date}>
                    {msg._id &&
                      currentUser?.starredGrpMessages.includes(msg._id) && (
                        <AiFillStar
                          color="rgba(0,0,0,.5)"
                          style={{
                            transform: "translateY(2px)"
                          }}
                        />
                      )}
                    {formatDistance(new Date(msg.createdAt), Date.now())}
                  </p>
                </div>
              </label>
            </span>
          )
        )}
    </React.Fragment>
  );
};

export default GroupMessages;
