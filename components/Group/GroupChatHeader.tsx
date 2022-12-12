import React from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Group } from "../../interfaces/Group";
import {
  SetGroupDisplay,
  setGroupDisplay,
  SetGroupSearch,
  setGroupSearch
} from "../../redux/actions";
import styles from "../../styles/groupChat.module.css";

interface Props {
  setGroupSearch: (set: boolean) => SetGroupSearch;
  setGroupDisplay: (set: boolean) => SetGroupDisplay;
  currentGroup: Group | null;
  setShowBox: React.Dispatch<React.SetStateAction<boolean>>;
}
const GroupChatHeader: React.FC<Props> = props => {
  const { currentGroup, setShowBox } = props;
  return (
    <div className={styles.header}>
      <HiOutlineArrowLeft
        size="30px"
        className={styles.HiOutlineArrowLeft}
        color="rgb(80,80,80)"
        onClick={() => props.setGroupDisplay(true)}
      />
      <div className={styles.user_info}>
        <img
          src={`http://gravatar.com/avatar/${
            currentGroup?._id || Math.random()
          }?d=identicon`}
          alt="pfp"
        />
        <div>
          <h1>{currentGroup?.name}</h1>
          <div className={styles.participants}>
            {currentGroup?.participants.map(grp => (
              <span key={grp._id}>
                {grp.firstName} {grp.lastName}
                {currentGroup.participants[currentGroup.participants.length - 1]
                  ._id !== grp._id
                  ? ", "
                  : " "}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.header_icons}>
        <div>
          <AiOutlineSearch
            size="20px"
            onClick={() => props.setGroupSearch(true)}
          />
        </div>
        <div
          onClick={() => setShowBox(show => !show)}
          className={styles.three_dots}
        >
          <span>&nbsp;</span>
          <span>&nbsp;</span>
          <span>&nbsp;</span>
        </div>
      </div>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators({ setGroupSearch, setGroupDisplay }, dispatch)
)(GroupChatHeader);
