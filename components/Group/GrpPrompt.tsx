import React from "react";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { axios } from "../../Axios";
import { Redux } from "../../interfaces/Redux";
import {
  clearChat,
  fetchAllGroups,
  fetchCurrentUser,
  SetGrpPrompt,
  setGrpPrompt
} from "../../redux/actions";
import styles from "../../styles/prompt.module.css";

interface Props {
  setGrpPrompt: (set: boolean) => SetGrpPrompt;
  clearChat: (id: string) => void;
  fetchAllGroups: () => void;
}
const GrpPrompt: React.FC<Props> = props => {
  const prompt = useSelector((state: Redux) => state.group.grpPrompt);
  const currentGroup = useSelector((state: Redux) => state.group.currentGroup);
  const exitGroup = async (grpId: string) => {
    try {
      await axios.get(`/api/leave/group/${grpId}`);
      props.fetchAllGroups();
    } catch (error) {
      console.log(error.response);
    }
  };
  return (
    <div
      className={`${styles.container} ${prompt ? styles.container__show : ""}`}
    >
      <div className={styles.body}>
        <p>Exit "{currentGroup?.name} group"?</p>
        <div className={styles.buttons}>
          <button onClick={() => props.setGrpPrompt(false)}>cancel</button>
          <button
            onClick={() => {
              exitGroup(currentGroup!._id);
              props.setGrpPrompt(false);
            }}
          >
            exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators({ setGrpPrompt, clearChat, fetchAllGroups }, dispatch)
)(GrpPrompt);
