import { formatRelative } from "date-fns";
import React, { useState } from "react";
import { BiCheck } from "react-icons/bi";
import { BsCheck } from "react-icons/bs";
import { IoIosArrowForward, IoIosExit } from "react-icons/io";
import { RiPencilFill } from "react-icons/ri";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { axios } from "../../Axios";
import { Redux } from "../../interfaces/Redux";
import { User } from "../../interfaces/User";
import {
  AddCurrentContact,
  addCurrentContact,
  fetchMessages,
  SetDisplay,
  setDisplay,
  SetGroupChat,
  setGroupChat,
  SetGroupInfo,
  setGroupInfo,
  SetGroupMsgInfo,
  setGroupMsgInfo,
  SetGroupSearch,
  setGroupSearch,
  SetGrpPrompt,
  setGrpPrompt,
  SetNewChat,
  setNewChat
} from "../../redux/actions";
import styles from "../../styles/groupInfo.module.css";

interface Props {
  setGroupInfo: (set: boolean) => SetGroupInfo;
  setNewChat: (set: boolean) => SetNewChat;
  addCurrentContact: (user: User) => AddCurrentContact;
  fetchMessages: (userId: string, count: number) => void;
  setDisplay: (set: boolean) => SetDisplay;
  setGroupChat: (set: boolean) => SetGroupChat;
  setGroupSearch: (set: boolean) => SetGroupSearch;
  setGroupMsgInfo: (set: boolean) => SetGroupMsgInfo;
  setGrpPrompt: (set: boolean) => SetGrpPrompt;
}
const GroupInfo: React.FC<Props> = props => {
  const [focused, setFocused] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [description, setDescription] = useState<string | null>(null);
  const groupInfo = useSelector((state: Redux) => state.group.groupInfo);
  const currentGroup = useSelector((state: Redux) => state.group.currentGroup);
  const grpMsgCount = useSelector((state: Redux) => state.group.grpMsgCount);
  const currentUser = useSelector((state: Redux) => state.user.currentUser);

  const updateGrpDesc = async (grpId: string) => {
    if (description && description.trim().length !== 0) {
      try {
        setLoading(true);
        await axios.post(`api/update/group/description/${grpId}`, {
          description
        });
        setLoading(false);
      } catch (error) {
        console.log(error.response);
        setLoading(false);
      }
    }
  };
  return (
    <div className={groupInfo ? styles.showGroupInfo : ""}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div onClick={() => props.setGroupInfo(false)}>
            <span>&nbsp;</span>
          </div>
          <p>Group Info</p>
        </div>
        <div className={`${styles.body}`}>
          <div className={styles.group_header}>
            <img
              src={`http://gravatar.com/avatar/${
                currentGroup?._id || Math.random()
              }?d=identicon`}
              alt="pfp"
            />
            <div>
              <h1>{currentGroup?.name}</h1>
              <p>
                Created On{" "}
                {formatRelative(new Date(currentGroup!.createdAt), Date.now())}
              </p>
            </div>
          </div>

          <div
            className={`${styles.description} ${loading ? styles.loading : ""}`}
          >
            <h1>Description</h1>
            <div className={`${styles.input} ${focused ? styles.focused : ""}`}>
              <input
                type="text"
                placeholder="Add group description"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={e => setDescription(e.target.value)}
                value={description || currentGroup?.description || ""}
              />
              <BsCheck
                size="19px"
                style={{ transform: "rotate(-10deg)" }}
                color="rgba(0,0,0,.5)"
                className={styles.BsCheck}
                onClick={() => updateGrpDesc(currentGroup!._id)}
              />
              {loading && <div className={`ui active inline loader`}></div>}
              <RiPencilFill
                color="rgba(0,0,0,.5)"
                className={styles.RiPencilFill}
              />
            </div>
          </div>

          <div className={styles.participants}>
            <div className={styles.p_header}>
              <h3>{currentGroup?.participants.length} participants</h3>
            </div>
            <div>
              {currentGroup?.participants.map(user => (
                <div
                  className={styles.participant}
                  key={user._id}
                  onClick={async () => {
                    if (user._id !== currentUser?._id) {
                      const res = await axios.get<User>(
                        `/api/contact/${user._id}`
                      );
                      props.addCurrentContact(res.data);
                      props.setNewChat(false);
                      props.fetchMessages(user._id, grpMsgCount);
                      props.setDisplay(false);
                      props.setGroupChat(false);
                      props.setGroupInfo(false);
                      props.setGroupSearch(false);
                      props.setGroupMsgInfo(false);
                    }
                  }}
                >
                  <img
                    src={`http://gravatar.com/avatar/${
                      user._id || Math.random()
                    }?d=identicon`}
                    alt="pfp"
                  />
                  <div>
                    <p>
                      {user.firstName} {user.lastName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.exit} onClick={() => props.setGrpPrompt(true)}>
            <div>
              <IoIosExit size="30px" />
              <p>Exit Group</p>
            </div>
          </div>
          <div></div>
        </div>
      </div>
      ;
    </div>
  );
};

export default connect<{}, Props>(null, dispatch =>
  bindActionCreators(
    {
      setGroupInfo,
      setGroupChat,
      setDisplay,
      addCurrentContact,
      setNewChat,
      fetchMessages,
      setGroupSearch,
      setGroupMsgInfo,
      setGrpPrompt
    },
    dispatch
  )
)(GroupInfo);
