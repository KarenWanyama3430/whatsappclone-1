import React, { useEffect, useRef } from "react";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { Redux } from "../../interfaces/Redux";
import {
  SetGroupInfo,
  setGroupInfo,
  SetGroupMsgInfo,
  setGroupMsgInfo,
  SetGroupSearch,
  setGroupSearch,
  SetGrpPrompt,
  setGrpPrompt,
  SetSelectGroupMessages,
  setSelectGroupMessages
} from "../../redux/actions";
import styles from "../../styles/groupChat.module.css";

interface Props {
  setShowBox: React.Dispatch<React.SetStateAction<boolean>>;
  setGroupInfo: (set: boolean) => SetGroupInfo;
  setSelectGroupMessages: (set: boolean) => SetSelectGroupMessages;
  setGroupSearch: (set: boolean) => SetGroupSearch;
  setGroupMsgInfo: (set: boolean) => SetGroupMsgInfo;
  setGrpPrompt: (set: boolean) => SetGrpPrompt;
}
const GroupBox: React.FC<Props> = props => {
  const boxRef = useRef<HTMLDivElement>(null);
  const groupInfo = useSelector((state: Redux) => state.group.groupInfo);
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    groupInfo && props.setShowBox(false);
  }, [groupInfo]);
  const handleClickOutside = (e: Event) => {
    // @ts-ignore
    if (boxRef.current && !boxRef.current.contains(e.target)) {
      props.setShowBox(false);
    }
  };
  return (
    <div className={styles.box} ref={boxRef}>
      <div
        onClick={() => {
          props.setGroupSearch(false);
          props.setGroupInfo(true);
          props.setGroupMsgInfo(false);
        }}
      >
        <p>Group Info</p>
      </div>
      <div onClick={() => props.setSelectGroupMessages(true)}>
        <p>Select Messages</p>
      </div>
      <div onClick={() => props.setGrpPrompt(true)}>
        <p>Exit Group</p>
      </div>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators(
    {
      setGroupInfo,
      setSelectGroupMessages,
      setGroupSearch,
      setGroupMsgInfo,
      setGrpPrompt
    },
    dispatch
  )
)(GroupBox);
