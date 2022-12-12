import styles from "../../styles/contacts.module.css";
import React, { useState } from "react";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { BiSearchAlt } from "react-icons/bi";
import {
  AddCurrentContact,
  FilterContact,
  filterContact,
  SetDisplay,
  setDisplay,
  addCurrentContact,
  fetchMessages,
  setNewGroup,
  SetNewGroup,
  setNewChat,
  SetNewChat,
  setGroupChat,
  SetGroupChat,
  setGroupInfo,
  SetGroupInfo,
  setGroupSearch,
  SetGroupSearch,
  setGroupMsgInfo,
  SetGroupMsgInfo
} from "../../redux/actions";
import { User } from "../../interfaces/User";
import { connect, useDispatch } from "react-redux";
import { MdGroupAdd } from "react-icons/md";
import { bindActionCreators } from "redux";

interface Props {
  newChatRef: React.RefObject<HTMLDivElement>;
  fixMT: boolean;
  setInputChange: React.Dispatch<React.SetStateAction<string | null>>;
  menuRef: React.RefObject<HTMLDivElement>;
  hideMenu: boolean;
  contacts: [] | User[] | null;
  filterContact: (text: string) => FilterContact;
  addCurrentContact: (user: User) => AddCurrentContact;
  fetchMessages: Function;
  setDisplay: (display: boolean) => SetDisplay;
  setNewGroup: (set: boolean) => SetNewGroup;
  setNewChat: (set: boolean) => SetNewChat;
  setGroupChat: (set: boolean) => SetGroupChat;
  setGroupInfo: (set: boolean) => SetGroupInfo;
  setGroupSearch: (set: boolean) => SetGroupSearch;
  setGroupMsgInfo: (set: boolean) => SetGroupMsgInfo;
}
const NewChat: React.FC<Props> = props => {
  const [focused, setFocused] = useState<boolean>(false);
  return (
    <div className={`${styles.newChat}`} ref={props.newChatRef}>
      <div
        className={`${styles.profile} ${styles.fixed} ${styles.profile_contacts}`}
      >
        <div onClick={() => props.setNewChat(false)}>
          <HiOutlineArrowLeft size="30px" />
        </div>
        <p>New Chat</p>
        <div
          className={` ${props.fixMT && styles.fix_mt} ${
            styles.fixed_input_2
          } ${focused ? styles.fixed_input_2__focused : ""}`}
        >
          <div className={styles.BiSearchAlt_2__parent}>
            <HiOutlineArrowLeft
              className={`${
                !focused
                  ? styles.HiOutlineArrowLeft
                  : styles.HiOutlineArrowLeft__show
              } `}
              color="#00bfa5"
            />
            <BiSearchAlt
              className={`${
                focused ? styles.BiSearchAlt_2 : styles.BiSearchAlt_2__hide
              } `}
              color="rgb(80, 80, 80)"
            />
          </div>
          <input
            type="text"
            className={`${styles.input_2}`}
            placeholder="Search Contact"
            onChange={e => {
              props.setInputChange(e.target.value);
              props.filterContact(e.target.value);
            }}
            onBlur={() => setFocused(false)}
            onFocus={() => setFocused(true)}
          />
        </div>
      </div>
      <div className={`${styles.profile}`}>
        <div
          ref={props.menuRef}
          className={`${styles.box} ${props.hideMenu && styles.hideMenu}`}
        ></div>
      </div>
      <div
        className={`${styles.profile} ${styles.new_group}`}
        onClick={() => props.setNewGroup(true)}
      >
        <div>
          <MdGroupAdd size="30px" />
        </div>
        <p>New Group</p>
      </div>
      {props.contacts &&
        props.contacts?.length !== 0 &&
        props.contacts.map((user, i) => (
          <div
            className={`${styles.profile} ${
              props.contacts![0]._id.toString() === user._id.toString()
                ? styles.msg_start
                : ""
            } ${
              props.contacts && props.contacts.length - 1 === i
                ? styles.last
                : ""
            }`}
            key={user._id}
            onClick={async () => {
              props.setNewChat(false);
              props.addCurrentContact(user);

              props.fetchMessages(user._id, 0, true);
              props.setDisplay(false);
              props.setGroupChat(false);
              props.setGroupInfo(false);
              props.setGroupSearch(false);
              props.setGroupMsgInfo(false);
            }}
          >
            <img
              className={styles.profile_img}
              src={`http://gravatar.com/avatar/${
                user?._id || Math.random()
              }?d=identicon`}
              alt=""
            />
            <div className={styles.user}>
              <div className={styles.user_header}>
                <h2>
                  {user.firstName} {user.lastName}
                </h2>
                <p>{new Date(user.createdAt).toLocaleDateString()} </p>
              </div>
              <p>{user.status}</p>
            </div>
          </div>
        ))}
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators(
    {
      fetchMessages,
      setDisplay,
      addCurrentContact,
      filterContact,
      setNewGroup,
      setNewChat,
      setGroupChat,
      setGroupInfo,
      setGroupSearch,
      setGroupMsgInfo
    },
    dispatch
  )
)(NewChat);
