import React, { useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { BiCheck, BiSearchAlt } from "react-icons/bi";
import { MdSend } from "react-icons/md";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { axios } from "../../Axios";
import { Redux } from "../../interfaces/Redux";
import { User } from "../../interfaces/User";
import {
  SetForwardTo,
  setForwardTo,
  setSelectGroupMessages,
  SetSelectGroupMessages
} from "../../redux/actions";
import styles from "../../styles/forwardTo.module.css";

interface Props {
  contacts: User[];
  setForwardTo: (set: boolean) => SetForwardTo;
  setSelectMessages: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectGroupMessages: (set: boolean) => SetSelectGroupMessages;
  setSelectedMessages: (value: React.SetStateAction<string[]>) => void;
}

const ForwardTo: React.FC<Props> = props => {
  const [input, setInput] = useState<string>("");
  const [focused, setFocused] = useState<boolean>(false);
  const [selected, setSelected] = useState<string[]>([]);

  const forwardTo = useSelector((state: Redux) => state.user.forwardTo);
  const message = useSelector((state: Redux) => state.user.message);
  const currentUser = useSelector((state: Redux) => state.user.currentUser);

  const filteredContacts =
    input.trim().length !== 0
      ? props.contacts.filter(ctx =>
          `${ctx.firstName}${ctx.lastName}`
            .toLowerCase()
            .includes(input.toLowerCase())
        )
      : props.contacts;
  const filtered = props.contacts.filter(ctx => selected.includes(ctx._id));
  return (
    <div
      className={`${styles.outer_container} ${
        forwardTo ? styles.forwardTo : ""
      }`}
    >
      <div
        className={`${styles.container} ${
          selected.length !== 0 ? styles.show_footer : ""
        }`}
      >
        <div className={styles.header}>
          <div className={styles.header_info}>
            <span
              onClick={() => {
                props.setForwardTo(false);
                setInput("");
              }}
            >
              <p className={styles.cancel}>&nbsp;</p>
            </span>
            <p>Forward message to</p>
          </div>
          <div className={`${styles.input} ${focused ? styles.focused : ""}`}>
            <div className={styles.icons}>
              <BiSearchAlt size="20px" />
              <AiOutlineArrowLeft size="20px" color="#009688" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={e => setInput(e.target.value)}
              value={input}
            />
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.chat_header}>
            <p>CHATS</p>
          </div>
          <div className={styles.contacts}>
            {filteredContacts.map(ctx => (
              <div
                className={`${styles.contact}`}
                key={ctx._id}
                onClick={() => {
                  if (selected) {
                    const idx = selected.indexOf(ctx._id);
                    const ids = [...selected];
                    if (idx !== -1) {
                      ids.splice(idx, 1);
                      setSelected(ids);
                    } else {
                      setSelected([ctx._id, ...selected]);
                    }
                  }
                  setInput("");
                }}
              >
                <div
                  className={`${styles.contact_div} ${
                    selected && selected.includes(ctx._id)
                      ? styles.selected
                      : ""
                  }`}
                >
                  <BiCheck size="25px" className={styles.check} />
                  <label htmlFor={ctx._id}></label>
                </div>
                <input
                  type="checkbox"
                  name={ctx._id}
                  id={ctx._id}
                  onChange={() => {
                    if (selected) {
                      const idx = selected.indexOf(ctx._id);
                      const ids = [...selected];
                      if (idx !== -1) {
                        ids.splice(idx, 1);
                        setSelected(ids);
                      } else {
                        setSelected([ctx._id, ...selected]);
                      }
                    }
                  }}
                  checked={selected ? selected.includes(ctx._id) : false}
                />
                <img
                  className={styles.profile_img}
                  src={`http://gravatar.com/avatar/${
                    ctx._id || Math.random()
                  }?d=identicon`}
                  alt=""
                />
                <div className={styles.name}>
                  <p>
                    {ctx.firstName} {ctx.lastName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.selected_names}>
            {filtered.length !== 0 &&
              filtered.map(ctx =>
                filtered[filtered.length - 1]._id !== ctx._id ? (
                  <span key={ctx._id}>
                    {ctx.firstName} {ctx.lastName}
                    {", "}
                  </span>
                ) : (
                  <span key={ctx._id}>
                    {ctx.firstName} {ctx.lastName}
                  </span>
                )
              )}
          </div>
          <div
            className={styles.MdSend}
            onClick={() => {
              filtered.length !== 0 &&
                message &&
                filtered.forEach(
                  async ctx =>
                    await axios.post("/api/new/message", {
                      message,
                      to: ctx._id,
                      from: currentUser?._id,
                      createdAt: new Date().toISOString()
                    })
                );
              props.setForwardTo(false);
              setInput("");
              setSelected([]);
              props.setSelectMessages(false);
              props.setSelectGroupMessages(false);
              props.setSelectedMessages([]);
            }}
          >
            <MdSend size="20px" color="white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators({ setForwardTo, setSelectGroupMessages }, dispatch)
)(ForwardTo);
