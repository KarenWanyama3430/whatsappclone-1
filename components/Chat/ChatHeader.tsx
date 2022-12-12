import styles from "../../styles/chat.module.css";

import React, { useEffect, useRef, useState } from "react";
import { User } from "../../interfaces/User";
import {
  SetDisplay,
  setDisplay,
  setPrompt,
  ToggleContactInfo,
  toggleContactInfo,
  ToggleSearchMessage,
  toggleSearchMessage
} from "../../redux/actions";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { connect } from "react-redux";
import { AiOutlineSearch } from "react-icons/ai";
import { formatRelative } from "date-fns";
import { bindActionCreators } from "redux";

interface Props {
  currentContact: User | null;
  setDisplay: (display: boolean) => SetDisplay;
  toggleContactInfo: (toggle: boolean) => ToggleContactInfo;
  showContactInfo: boolean;
  setSelectMessages: React.Dispatch<React.SetStateAction<boolean>>;
  selectMessages: boolean;
  toggleSearchMessage: (toggle: boolean) => ToggleSearchMessage;
  setPrompt: (set: boolean) => void;
}

const ChatHeader: React.FC<Props> = props => {
  const [clicked, setClicked] = useState<boolean>(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (e: Event) => {
    // @ts-ignore
    if (boxRef && boxRef.current && !boxRef.current.contains(e.target)) {
      setClicked(false);
    }
  };

  const renderUserInfo = (): JSX.Element => {
    if (props.currentContact?.typing) {
      return <p>Typing...</p>;
    }
    if (props.currentContact?.online) {
      return <p>Online</p>;
    }
    if (props.currentContact?.lastSeen) {
      return (
        <p>
          Last seen{" "}
          {formatRelative(new Date(props.currentContact.lastSeen), Date.now())}
        </p>
      );
    }
    if (props.currentContact?.status) {
      return <p>{props.currentContact.status}</p>;
    }
    return <p></p>;
  };

  return (
    <div
      className={`${
        props.showContactInfo
          ? `${styles.contact_info} ${styles.contact_info_header}`
          : styles.chatHeader
      }`}
    >
      <div>
        <div
          className={styles.arrow_left}
          onClick={() => props.setDisplay(true)}
        >
          <HiOutlineArrowLeft size="30px" />
        </div>
        <img
          className={styles.profile_img}
          src={`http://gravatar.com/avatar/${
            props.currentContact?._id || Math.random()
          }?d=identicon`}
          alt=""
          onClick={() => props.toggleContactInfo(true)}
        />
      </div>
      <div
        className={styles.userInfo}
        onClick={() => props.toggleContactInfo(true)}
      >
        <h1>
          {props.currentContact?.firstName} {props.currentContact?.lastName}
        </h1>
        {renderUserInfo()}
      </div>
      <div className={styles.chatIcons}>
        <div>
          <AiOutlineSearch
            size="20px"
            className={styles.AiOutlineSearch}
            onClick={() => props.toggleSearchMessage(true)}
          />
        </div>
        <div
          className={`${styles.threeDots} ${
            clicked && !props.showContactInfo && !props.selectMessages
              ? styles.dots_color
              : ""
          }`}
          onClick={() => setClicked(cl => !cl)}
        >
          <div className={styles.select_icon}></div>
          <div className={styles.select_icon}></div>
          <div className={styles.select_icon}></div>
          {!props.showContactInfo && !props.selectMessages && (
            <div
              className={`${styles.box} ${!clicked ? styles.hide_box : ""}`}
              ref={boxRef}
            >
              <p
                onClick={() => {
                  setClicked(false);
                  props.toggleContactInfo(true);
                }}
              >
                Contact Info
              </p>
              <p
                onClick={() => {
                  setClicked(false);
                  props.setSelectMessages(true);
                }}
              >
                Select Messages
              </p>
              <p
                onClick={() => {
                  props.setPrompt(true);
                  setClicked(false);
                }}
              >
                Clear Chat
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators(
    {
      setDisplay,
      toggleContactInfo,
      toggleSearchMessage,
      setPrompt
    },
    dispatch
  )
)(ChatHeader);
