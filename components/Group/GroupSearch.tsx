import { formatDistance } from "date-fns";
import React, { useState } from "react";
import { AiOutlineArrowLeft, AiOutlineSearch } from "react-icons/ai";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { GroupMsg } from "../../interfaces/GroupMsg";
import { Redux } from "../../interfaces/Redux";
import {
  SetGroupSearch,
  setGroupSearch,
  SetGrpScrollMsg,
  setGrpScrollMsg
} from "../../redux/actions";
import styles from "../../styles/groupSearch.module.css";

interface Props {
  setGroupSearch: (set: boolean) => SetGroupSearch;
  setGrpScrollMsg: (msg: GroupMsg) => SetGrpScrollMsg;
}
const GroupSearch: React.FC<Props> = props => {
  const groupSearch = useSelector((state: Redux) => state.group.groupSearch);
  const groupMessages = useSelector(
    (state: Redux) => state.group.groupMessages
  );
  const currentUser = useSelector((state: Redux) => state.user.currentUser);
  const currentGroup = useSelector((state: Redux) => state.group.currentGroup);

  const [input, setInput] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);

  const filteredMessages =
    groupMessages?.length !== 0 &&
    input.trim().length !== 0 &&
    groupMessages?.filter(msg =>
      msg.message.toLocaleLowerCase().includes(input.toLocaleLowerCase())
    );

  const renderTick = (grpMsg: GroupMsg) => {
    if (
      grpMsg.read &&
      grpMsg.readBy?.length === currentGroup!.participants.length - 1
    ) {
      return (
        <BsCheckAll
          size="17px"
          style={{ transform: "rotate(-10deg)" }}
          color="#4fc3f7"
        />
      );
    }
    if (grpMsg.read) {
      return (
        <BsCheckAll
          size="17px"
          style={{ transform: "rotate(-10deg)" }}
          color="rgba(0,0,0,.5)"
        />
      );
    }

    if (grpMsg._id) {
      return (
        <BsCheck
          size="17px"
          style={{ transform: "rotate(-10deg)" }}
          color="rgba(0,0,0,.5)"
        />
      );
    }
  };
  return (
    <div className={!groupSearch ? styles.groupSearch__hide : ""}>
      <div className={`${styles.container} ${focused ? styles.focused : ""}`}>
        <div className={styles.header}>
          <div className={styles.sm_header}>
            <p
              className={styles.cancel}
              onClick={() => {
                props.setGroupSearch(false);
                setInput("");
              }}
            >
              <span>&nbsp;</span>
            </p>
            <p>Search Messages</p>
          </div>
          <div className={styles.input}>
            <div className={styles.icons}>
              <AiOutlineSearch
                className={
                  focused
                    ? styles.AiOutlineSearch_rotate
                    : styles.AiOutlineSearch
                }
                size="20px"
                color="rgb(80,80,80)"
              />

              <AiOutlineArrowLeft
                className={
                  focused
                    ? styles.AiOutlineArrowLeft
                    : styles.AiOutlineArrowLeft_rotate
                }
                size="20px"
                color="#009688"
              />
            </div>
            <input
              type="text"
              onChange={e => setInput(e.target.value)}
              value={input}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </div>
        </div>
        <div className={styles.body}>
          {filteredMessages && filteredMessages.length !== 0 ? (
            filteredMessages.map(msg =>
              currentUser?._id === msg.from._id ? (
                <div
                  className={styles.message}
                  key={msg.createdAt}
                  onClick={() => {
                    props.setGroupSearch(false);
                    props.setGrpScrollMsg(msg);
                    setInput("");
                  }}
                >
                  <p className={styles.date}>
                    {formatDistance(new Date(msg.createdAt), Date.now())}
                  </p>
                  <div>
                    {renderTick(msg)}
                    <p className={styles.text}>{msg.message}</p>
                  </div>
                </div>
              ) : (
                <div
                  className={styles.message}
                  key={msg.createdAt}
                  onClick={() => {
                    props.setGroupSearch(false);
                    props.setGrpScrollMsg(msg);
                    setInput("");
                  }}
                >
                  <p className={styles.date}>
                    {formatDistance(new Date(msg.createdAt), Date.now())}
                  </p>
                  <div>
                    <div className={styles.name}>
                      <p>
                        {msg.from.firstName} {msg.from.lastName}
                      </p>
                    </div>
                    <p className={styles.text}>{msg.message}</p>
                  </div>
                </div>
              )
            )
          ) : (
            <div className={styles.no_msgs}>
              <p>Search for messages within {currentGroup?.name}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators({ setGroupSearch, setGrpScrollMsg }, dispatch)
)(GroupSearch);
