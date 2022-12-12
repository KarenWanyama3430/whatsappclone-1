import React, { useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { IoMdCheckmark } from "react-icons/io";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { axios } from "../../Axios";
import { Redux } from "../../interfaces/Redux";
import { User } from "../../interfaces/User";
import {
  SetGroupContainer,
  setGroupContainer,
  SetGroupSubject,
  setGroupSubject,
  SetNewChat,
  setNewChat,
  SetNewGroup,
  setNewGroup,
  SetSelectedContacts,
  setSelectedContacts
} from "../../redux/actions";
import styles from "../../styles/groupSubject.module.css";
import NextImage from "next/image";

interface Props {
  setGroupSubject: (set: boolean) => SetGroupSubject;
  setSelectedContacts: (cts: User[] | []) => SetSelectedContacts;
  setGroupContainer: (set: boolean) => SetGroupContainer;
  setNewGroup: (set: boolean) => SetNewGroup;
  setNewChat: (set: boolean) => SetNewChat;
}
const GroupSubject: React.FC<Props> = props => {
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const groupSubject = useSelector((state: Redux) => state.group.groupSubject);
  const selectedContacts = useSelector(
    (state: Redux) => state.group.selectedContacts
  );

  const newGroup = async (grpData: {
    name: string;
    participants: string[];
  }): Promise<void> => {
    try {
      setLoading(true);
      setSubmitted(true);
      await axios.post("/api/new/group", grpData);
      setLoading(false);
      props.setSelectedContacts([]);
      props.setGroupSubject(false);
      props.setNewGroup(false);
      props.setNewChat(false);
      props.setGroupContainer(true);
    } catch (error) {
      setLoading(false);
      setSubmitted(false);
      console.log(error.response);
    }
  };
  return (
    <div className={groupSubject ? styles.container__show : ""}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div onClick={() => props.setGroupSubject(false)}>
            <AiOutlineArrowLeft size="20px" />
          </div>
          <div>
            <p>New Group</p>
          </div>
        </div>
        <div className={styles.group_pfp}>
          <NextImage
            unsized
            src="/blank-profile-picture-973460_640.png"
            alt="grp_img"
          />
        </div>
        <div
          className={`${styles.input}  ${
            input.trim().length !== 0 ? styles.checkmark__show : ""
          } ${loading ? styles.loading : ""}`}
        >
          <input
            type="text"
            onChange={e => setInput(e.target.value)}
            value={input}
          />
          <div
            className={
              input.length !== 0 ? styles.transform__up : styles.transform
            }
          >
            <p>Group Subject</p>
          </div>
          <span>&nbsp;</span>
          <div
            className={styles.checkmark}
            onClick={() =>
              !submitted &&
              input.trim().length !== 0 &&
              newGroup({
                name: input,
                participants: (selectedContacts as User[]).map(ct => ct._id)
              })
            }
          >
            <IoMdCheckmark size="30px" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect<{}, Props>(null, dispatch =>
  bindActionCreators(
    {
      setGroupSubject,
      setSelectedContacts,
      setGroupContainer,
      setNewGroup,
      setNewChat
    },
    dispatch
  )
)(GroupSubject);
