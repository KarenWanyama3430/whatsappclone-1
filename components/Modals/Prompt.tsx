import React from "react";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { Redux } from "../../interfaces/Redux";
import { clearChat, SetPrompt, setPrompt } from "../../redux/actions";
import styles from "../../styles/prompt.module.css";

interface Props {
  setPrompt: (set: boolean) => SetPrompt;
  clearChat: (id: string) => void;
}

const Prompt: React.FC<Props> = props => {
  const prompt = useSelector((state: Redux) => state.message.prompt);
  const currentContact = useSelector(
    (state: Redux) => state.user.currentContact
  );
  return (
    <div
      className={`${styles.container} ${prompt ? styles.container__show : ""}`}
    >
      <div className={styles.body}>
        <p>
          Clear chat with "{currentContact?.firstName}{" "}
          {currentContact?.lastName}"?
        </p>
        <div className={styles.buttons}>
          <button onClick={() => props.setPrompt(false)}>cancel</button>
          <button
            onClick={() => {
              props.clearChat(currentContact!._id);
              props.setPrompt(false);
            }}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators({ setPrompt, clearChat }, dispatch)
)(Prompt);
