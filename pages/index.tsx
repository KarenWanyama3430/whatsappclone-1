import { GetServerSideProps, NextPageContext } from "next";
import React, { useEffect, useState } from "react";
import { axios } from "../Axios";
import Chat from "../components/Chat/Chat";
import Contacts from "../components/Contacts/Contacts";
import { withAuth } from "../HOCs/withAuth";
import { User } from "../interfaces/User";
import styles from "../styles/main.module.css";
import Error from "next/error";
import { ContactsContext } from "../Context/contactsContext";
import { Message } from "../interfaces/Message";
import { MessagesContext } from "../Context/messagesContext";
import openSocket from "socket.io-client";
import {
  addContact,
  AddNewMessage,
  addNewMessage,
  updateLastMsg,
  UpdateLastMsg,
  UpdateOnline,
  updateUser,
  updateOnline,
  UpdateTyping,
  updateTyping,
  addGroup,
  AddGroup,
  addGroupMessage,
  AddGroupMessage,
  setGroupDelivered,
  SetGroupDelivered,
  setGroupRead,
  SetGroupRead,
  deleteMessage,
  DeleteMessage,
  updateGrpDescription,
  UpdateGrpDescription,
  deleteGrpMsg,
  DeleteGrpMsg
} from "../redux/actions";
import { connect, useSelector } from "react-redux";
import { ActionTypes } from "../redux/actions/types";
import WithoutChat from "../components/WithoutChat";
import { Redux } from "../interfaces/Redux";
import { useBeforeunload } from "react-beforeunload";
import ContactInfo from "../components/Chat/ContactInfo";
import SearchMessage from "../components/Chat/SearchMessage";
import MessageInfo from "../components/Chat/MessageInfo";
import NewGroupContacts from "../components/Group/NewGroupContacts";
import { bindActionCreators } from "redux";
import GroupSubject from "../components/Group/GroupSubject";
import { Group } from "../interfaces/Group";
import GroupComponent from "../components/Group/Group";
import { GroupMsg } from "../interfaces/GroupMsg";
import GroupChat from "../components/Group/GroupChat";
import GroupInfo from "../components/Group/GroupInfo";
import GroupSearch from "../components/Group/GroupSearch";
import GroupMsgInfo from "../components/Group/GroupMsgInfo";
import ForwardTo from "../components/Modals/ForwardTo";
import Starred from "../components/Contacts/Starred";
import Prompt from "../components/Modals/Prompt";
import GrpPrompt from "../components/Group/GrpPrompt";
import Loading from "../components/Loading";
import { initializeStore } from "../redux";

export const io =
  process.env.NODE_ENV === "development"
    ? openSocket.io("http://localhost:3000")
    : openSocket.io("https://whatsapp-2.herokuapp.com");

interface Props {
  messages?: Message[] | [];
  statusCode?: number;
  addContact: Function;
  addNewMessage: (message: Message) => void;
  updateLastMsg: (message: Message) => UpdateLastMsg;
  contacts: User[] | [];
  updateUser: (user?: { [key: string]: any }) => void;
  updateOnline: (user: User) => UpdateOnline;
  updateTyping: (user: User) => UpdateTyping;
  addGroup: (grp: Group, usr: User) => AddGroup;
  addGroupMessage: (msg: GroupMsg) => AddGroupMessage;
  setGroupDelivered: () => void;
  setGroupRead: (msgs: GroupMsg[]) => SetGroupRead;
  deleteMessage: (msgId: string) => DeleteMessage;
  updateGrpDescription: (grp: Group) => UpdateGrpDescription;
  deleteGrpMsg: (_id: string) => DeleteGrpMsg;
}
const index = (props: Props) => {
  if (props.statusCode) {
    return <Error statusCode={props.statusCode} />;
  }
  const [loaded, setLoaded] = useState<boolean>(false);
  const [logoutLoading, setlogoutLoading] = useState<boolean>(false);
  const [selectMessages, setSelectMessages] = useState<boolean>(false);
  const [selectedGrpMessages, setSelectedGrpMessages] = useState<string[]>([]);
  if (typeof window !== "undefined") {
    window.onload = (e: Event) => {
      setLoaded(true);
    };
  }
  useEffect(() => {
    setLoaded(true);
  }, []);
  const currentContact = useSelector<Redux>(
    state => state.user.currentContact
  ) as Redux["user"]["currentContact"];
  const currentUser = useSelector<Redux>(
    state => state.user.currentUser
  ) as Redux["user"]["currentUser"];
  const contacts = useSelector<Redux>(state => state.user.contacts) as Redux["user"]["contacts"];
  const showContactInfo = useSelector<Redux>(
    state => state.user.showContactInfo
  ) as Redux["user"]["showContactInfo"];
  const groups = useSelector<Redux>(state => state.group.groups) as Redux["group"]["groups"];
  const currentGroup = useSelector<Redux>(
    state => state.group.currentGroup
  ) as Redux["group"]["currentGroup"];
  const groupMessages = useSelector<Redux>(
    state => state.group.groupMessages
  ) as Redux["group"]["groupMessages"];
  const selectedInfoMsg = useSelector<Redux>(
    state => state.group.selectedInfoMsg
  ) as Redux["group"]["selectedInfoMsg"];
  const showMessageInfo = useSelector<Redux>(
    state => state.message.showMessageInfo
  ) as Redux["message"]["showMessageInfo"];

  useEffect(() => {
    io.on("contacts", (data: { action: string; contact: User }) => {
      if (data.action === "create") {
        props.addContact(data.contact);
      }
    });
    io.on(`message`, (data: { action: string; message: Message }) => {
      if (data.action === "create") {
        props.addNewMessage(data.message);
      }
    });
    io.on(`message`, (data: { action: string; message: Message }) => {
      if (data.action === "update") {
        if (
          data.message.to._id.toString() !== currentUser?._id.toString() &&
          data.message.from._id.toString() !== currentUser?._id.toString()
        ) {
          return;
        }
        props.updateLastMsg(data.message);
      }
    });
    io.on(`message`, (data: { action: string; _id: string }) => {
      if (data.action === "delete") {
        props.deleteMessage(data._id);
      }
    });
    // LISTEN FOR A NEW GROUP
    io.on("group", (data: { action: string; group: Group }) => {
      if (data.action === "create") {
        if (data.group.participants.find(pat => pat._id === currentUser?._id.toString())) {
          props.addGroup(data.group, currentUser!);
        }
      }

      if (data.action === "description") {
        props.updateGrpDescription(data.group);
      }
    });
    io.on("groupMsg", (data: { action: "delete"; _id: string }) => {
      if (data.action === "delete") {
        props.deleteGrpMsg(data._id);
      }
    });
    if (groups && groups.length !== 0) {
      (groups as Group[]).map(grp => {
        // LISTEN FOR GROUP MESSAGES
        io.on(`${grp._id}`, (data: { action: "create"; message: GroupMsg }) => {
          if (data.action === "create") {
            grp._id.toString() === data.message.group._id.toString() &&
              props.addGroupMessage(data.message);
          }
        });

        // UPDATE CURRENT GROUP MESSAGE
        io.on(`${grp._id}`, (data: { action: "update"; message: Group }) => {
          if (data.action === "update") {
            props.addGroup(data.message, currentUser!);
          }
        });
      });
      io.on("groupread", (data: { action: "change"; groupMsgs: GroupMsg[] }) => {
        if (data.action === "change") {
          props.setGroupRead(data.groupMsgs);
        }
      });
    }

    io.on("active", (data: { action: string; user: User }) => {
      if (data.action === "change") {
        props.updateOnline(data.user);
      }
    });
    io.on("typing", (data: { action: string; user: User }) => {
      if (data.action === "change") {
        props.updateTyping(data.user);
      }
    });
  }, [currentContact ? currentContact._id : currentContact]);
  useEffect(() => {
    const user = {
      ...currentUser,
      online: true,
      updatedAt: new Date().toISOString()
    } as User;
    io.emit("active", { action: "change", user });
    props.setGroupDelivered();
  }, []);
  useEffect(() => {
    props.setGroupDelivered();
  }, [currentGroup, groupMessages ? groupMessages.length : groupMessages]);

  if (typeof document !== "undefined") {
    useBeforeunload(e => {
      // update active state
      props.updateUser({ lastSeen: new Date() });
      const user = {
        ...currentUser,
        online: false,
        lastSeen: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as User;
      io.emit("active", { action: "change", user });
    });
    useEffect(() => {
      document.addEventListener("visibilitychange", () => {
        // update active state
        if (document.hidden) {
          props.updateUser({ lastSeen: new Date() });
          const user = {
            ...currentUser,
            online: false,
            lastSeen: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as User;
          io.emit("active", { action: "change", user });
        } else {
          const user = {
            ...currentUser,
            online: true,
            updatedAt: new Date().toISOString()
          } as User;
          io.emit("active", { action: "change", user });
        }
      });
      window.addEventListener("focus", () => {
        const user = {
          ...currentUser,
          online: true,
          updatedAt: new Date().toISOString()
        } as User;
        io.emit("active", { action: "change", user });
      });
      window.addEventListener("blur", () => {
        props.updateUser({ lastSeen: new Date() });
        const user = {
          ...currentUser,
          online: false,
          lastSeen: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as User;
        io.emit("active", { action: "change", user });
      });

      return () => {
        document.removeEventListener("visibilitychange", () => {
          // update active state
          if (document.hidden) {
            props.updateUser({ lastSeen: new Date() });
            const user = {
              ...currentUser,
              online: false,
              lastSeen: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            } as User;
            io.emit("active", { action: "change", user });
          } else {
            const user = {
              ...currentUser,
              online: true,
              updatedAt: new Date().toISOString()
            } as User;
            io.emit("active", { action: "change", user });
          }
        });
        window.removeEventListener("blur", () => {
          props.updateUser({ lastSeen: new Date() });
          const user = {
            ...currentUser,
            online: false,
            lastSeen: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          } as User;
          io.emit("active", { action: "change", user });
        });
        window.removeEventListener("focus", () => {
          const user = {
            ...currentUser,
            online: true,
            updatedAt: new Date().toISOString()
          } as User;
          io.emit("active", { action: "change", user });
        });
      };
    }, [document.addEventListener, window.addEventListener]);
  }
  const logoutLoadingFunc = (loading: boolean) => {
    setlogoutLoading(loading);
  };
  return (
    <div className={`${styles.container} ${!loaded ? styles.not_loaded : styles.loaded}`}>
      <ContactsContext.Provider value={{ contacts: props.contacts }}>
        <MessagesContext.Provider value={props.messages!}>
          <Contacts logoutLoadingFunc={logoutLoadingFunc} />
          {logoutLoading && <Loading />}
          <Starred />
          <GroupComponent />
          <NewGroupContacts />
          <GroupSubject />
          {currentContact ? (
            <Chat selectMessages={selectMessages} setSelectMessages={setSelectMessages} />
          ) : (
            <WithoutChat />
          )}
          {currentGroup && (
            <GroupChat
              selectedMessages={selectedGrpMessages}
              setSelectedMessages={setSelectedGrpMessages}
            />
          )}
          {selectedInfoMsg && <GroupMsgInfo />}
          <GroupSearch />
          {currentGroup && <GroupInfo />}
          {contacts && (
            <ForwardTo
              setSelectMessages={setSelectMessages}
              contacts={contacts}
              setSelectedMessages={setSelectedGrpMessages}
            />
          )}
          {currentContact && <Prompt />}
          {currentGroup && <GrpPrompt />}
          {showContactInfo && <ContactInfo />}
          <SearchMessage />
          {showMessageInfo && <MessageInfo />}
        </MessagesContext.Provider>
      </ContactsContext.Provider>
    </div>
  );
};

export interface FetchLastMsg {
  type: ActionTypes.fetchLastMsg;
  payload: Message[] | [];
}
export interface FetchAllGroups {
  type: ActionTypes.fetchAllGroups;
  payload: Group[] | [];
  left?: boolean;
}
export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const store = initializeStore();
    const authenticated = await withAuth(ctx, store);
    if (!authenticated) {
      return {
        redirect: {
          destination: "/login",
          permanent: true
        }
      };
    }
    const lastMsgs = await axios.get<FetchLastMsg["payload"]>("/api/last/msg", {
      headers: ctx.req?.headers
    });
    store.dispatch<FetchLastMsg>({
      type: ActionTypes.fetchLastMsg,
      payload: lastMsgs.data
    });
    const res = await axios.get<User[]>("/api/all/contacts", {
      headers: ctx.req?.headers
    });
    store.dispatch({ type: ActionTypes.fetchContacts, payload: res.data });

    const grpres = await axios.get<FetchAllGroups["payload"]>("/api/all/groups", {
      headers: ctx.req?.headers
    });
    store.dispatch<FetchAllGroups>({
      type: ActionTypes.fetchAllGroups,
      payload: grpres.data
    });
    return {
      props: {
        contacts: res.data,
        initialReduxState: store.getState()
      }
    };
  } catch (error) {
    console.log(error);
    if (error.response && error.response.status) {
      return {
        redirect: {
          destination: "/login",
          permanent: true
        }
      };
    }
    return { props: {} };
  }
};

export default connect(null, dispatch =>
  bindActionCreators(
    {
      addContact,
      addNewMessage,
      updateLastMsg,
      updateUser,
      updateOnline,
      updateTyping,
      addGroup,
      addGroupMessage,
      setGroupDelivered,
      setGroupRead,
      deleteMessage,
      updateGrpDescription,
      deleteGrpMsg
    },
    dispatch
  )
)(index);
