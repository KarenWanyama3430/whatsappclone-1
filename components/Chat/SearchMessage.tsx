import { formatDistance } from "date-fns";
import React, { useEffect, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineSearch } from "react-icons/ai";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { connect, useSelector } from "react-redux";
import { Message } from "../../interfaces/Message";
import { Redux } from "../../interfaces/Redux";
import {
  setScrollMessage,
  ScrollMessage,
  toggleSearchMessage,
  ToggleSearchMessage,
  toggleContactInfo,
  ToggleContactInfo,
  fetchMessages
} from "../../redux/actions";
import styles from "../../styles/searchMessage.module.css";
import stringReplace from "react-string-replace";
import { bindActionCreators } from "redux";

interface Props {
  toggleSearchMessage: (toggle: boolean) => ToggleSearchMessage;
  setScrollMessage: (msg: Message) => ScrollMessage;
  toggleContactInfo: (toggle: boolean) => ToggleContactInfo;
  fetchMessages: (id: string, count: number) => void;
}

const SearchMessage: React.FC<Props> = props => {
  const [focused, setFocused] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");
  const showSearchMessage = useSelector(
    (state: Redux) => state.message.showSearchMessage
  ) as Redux["message"]["showSearchMessage"];
  const reduxMessages = useSelector(
    (state: Redux) => state.message.messages
  ) as Redux["message"]["messages"];
  const currentContact = useSelector(
    (state: Redux) => state.user.currentContact
  ) as Redux["user"]["currentContact"];
  const currentUser = useSelector(
    (state: Redux) => state.user.currentUser
  ) as Redux["user"]["currentUser"];
  const msgCount = useSelector(
    (state: Redux) => state.message.msgCount
  ) as Redux["message"]["msgCount"];
  const renderTick = (msg: Message): JSX.Element => {
    if (!msg._id) {
      return <span></span>;
    }
    if (
      msg._id &&
      !msg.read &&
      msg.secondTick &&
      msg.to._id.toString() !== currentUser?._id.toString() &&
      currentContact?._id.toString() === msg.to._id.toString()
    ) {
      // DOUBLE TICK
      return (
        <BsCheckAll
          size="17px"
          style={{ transform: "rotate(-10deg)" }}
          color="rgb(80,80,80)"
        />
      );
    }
    if (
      msg._id &&
      !msg.read &&
      msg.to._id.toString() !== currentUser?._id.toString()
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
      currentContact &&
      currentContact._id.toString() === msg.to._id.toString()
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
  return (
    <div className={showSearchMessage ? styles.showSearchMessage : ""}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p
            onClick={() => {
              props.toggleSearchMessage(false);
              setInput("");
            }}
          >
            <span>&nbsp;</span>
          </p>
          <p>Search Messages</p>
        </div>
        <div
          className={`${styles.search} ${focused ? styles.search__white : ""}`}
        >
          <div>
            <div
              className={
                focused
                  ? styles.AiOutlineSearch__hidden
                  : styles.AiOutlineSearch
              }
            >
              <AiOutlineSearch size="20px" color="rgb(80,80,80)" />
            </div>
            <div
              className={
                focused
                  ? styles.AiOutlineArrowLeft
                  : styles.AiOutlineArrowBottom
              }
            >
              <AiOutlineArrowLeft size="20px" color="#009688" />
            </div>
          </div>
          <input
            type="text"
            placeholder="Search..."
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={e => setInput(e.target.value)}
            value={input}
          />
        </div>
        <div className={styles.messages}>
          {input.trim().length !== 0 ? (
            reduxMessages &&
            reduxMessages.length !== 0 &&
            (reduxMessages as Message[])
              .filter(
                msg =>
                  msg._id &&
                  msg.message.toLowerCase().includes(input.toLowerCase())
              )
              .map(msg => (
                <div
                  className={styles.message}
                  onClick={() => {
                    props.fetchMessages(currentContact!._id, msgCount);
                    props.toggleContactInfo(false);
                    props.toggleSearchMessage(false);
                    props.setScrollMessage(msg);
                    setInput("");
                  }}
                  key={msg._id}
                >
                  <div className={styles.date}>
                    {formatDistance(new Date(msg.createdAt), Date.now())}
                  </div>
                  <div className={styles.content}>
                    <div>{renderTick(msg)}</div>
                    <p>
                      {stringReplace(
                        msg.message,
                        input,
                        (match, index, offset) => {
                          return (
                            <span
                              key={index}
                              style={{
                                // @ts-ignore
                                fontWeight: "700",
                                color: "#009688"
                              }}
                            >
                              {match}
                            </span>
                          );
                        }
                      )}
                    </p>
                  </div>
                </div>
              ))
          ) : currentContact && showSearchMessage ? (
            <div className={styles.no_messages}>
              Search for messages with{" "}
              {`${currentContact?.firstName} ${currentContact?.lastName}`}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default connect<{}, Props>(null, dispatch =>
  bindActionCreators(
    {
      toggleSearchMessage,
      setScrollMessage,
      toggleContactInfo,
      fetchMessages
    },
    dispatch
  )
)(SearchMessage);
