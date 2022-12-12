import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/contacts.module.css";
import { connect, useSelector } from "react-redux";
import { Redux } from "../../interfaces/Redux";
import NewChat from "./NewChat";
import Header from "./Header";
import Box from "./Box";
import RecentChats from "./RecentChats";
import Profile from "./Profile";
import { SetNewChat, setNewChat } from "../../redux/actions";
import { bindActionCreators } from "redux";

interface Props {
  setNewChat: (set: boolean) => SetNewChat;
  logoutLoadingFunc: (loading: boolean) => void;
}
const Main: React.FC<Props> = props => {
  const [hideIcon, setHideIcon] = useState<boolean>(false);
  const [hideMenu, setHideMenu] = useState<boolean>(true);
  const [fixMT, setFixMT] = useState<boolean>(false);
  const [inputChange, setInputChange] = useState<string | null>(null);
  const contacts = useSelector<Redux>(
    state => state.user.filteredContacts
  ) as Redux["user"]["contacts"];
  const currentUser = useSelector<Redux>(
    state => state.user.currentUser
  ) as Redux["user"]["currentUser"];
  const filteredRecentChats = useSelector<Redux>(
    state => state.message.filteredRecentChats
  ) as Redux["message"]["filteredRecentChats"];
  const messages = useSelector<Redux>(
    state => state.message.messages
  ) as Redux["message"]["messages"];
  const showProfile = useSelector<Redux>(
    state => state.user.showProfile
  ) as Redux["user"]["showProfile"];
  const newChat = useSelector<Redux>(
    state => state.user.newChat
  ) as Redux["user"]["newChat"];
  const menuRef = useRef<HTMLDivElement>(null);
  const newChatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    showProfile && setHideMenu(true);
  }, [showProfile]);
  useEffect(() => {
    if (
      newChatRef.current &&
      newChatRef.current.offsetHeight < newChatRef.current.scrollHeight
    ) {
      setFixMT(false);
    } else {
      setFixMT(true);
    }
  }, [inputChange]);
  const handleClickOutside = (e: Event) => {
    // @ts-ignore
    if (menuRef && menuRef.current && !menuRef.current?.contains(e.target)) {
      setHideMenu(true);
    }
  };
  return (
    <div className={`${styles.container} ${newChat && styles.newChat_show}`}>
      <NewChat
        contacts={contacts}
        fixMT={fixMT}
        hideMenu={hideMenu}
        menuRef={menuRef}
        newChatRef={newChatRef}
        setInputChange={setInputChange}
      />
      <Header
        setHideIcon={setHideIcon}
        hideIcon={hideIcon}
        hideMenu={hideMenu}
        setHideMenu={setHideMenu}
      />
      <Profile />
      <Box
        hideMenu={hideMenu}
        menuRef={menuRef}
        logoutLoadingFunc={props.logoutLoadingFunc}
      />
      <RecentChats
        currentUser={currentUser}
        filteredRecentChats={filteredRecentChats}
        messages={messages}
      />
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators({ setNewChat }, dispatch)
)(Main);
