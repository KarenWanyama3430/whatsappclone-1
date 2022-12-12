import React, { useEffect, useState } from "react";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { Redux } from "../../interfaces/Redux";
import { User } from "../../interfaces/User";
import {
  setGroupSubject,
  SetGroupSubject,
  setNewGroup,
  SetNewGroup,
  SetSelectedContacts,
  setSelectedContacts
} from "../../redux/actions";
import styles from "../../styles/NewGroupContacts.module.css";

interface Props {
  setNewGroup: (set: boolean) => SetNewGroup;
  setGroupSubject: (set: boolean) => SetGroupSubject;
  setSelectedContacts: (ctx: User[]) => SetSelectedContacts;
}
const NewGroupContacts: React.FC<Props> = props => {
  const [contacts, setContacts] = useState<User[] | [] | null>(null);
  const selectedContacts = useSelector(
    (state: Redux) => state.group.selectedContacts
  );
  const [input, setInput] = useState<string>("");
  const reduxContacts = useSelector((state: Redux) => state.user.contacts);
  const newGroup = useSelector((state: Redux) => state.group.newGroup);
  useEffect(() => {
    setContacts(reduxContacts);
  }, []);
  useEffect(() => {
    if (selectedContacts.length === 0) {
      setContacts(reduxContacts);
    }
  }, [selectedContacts.length]);
  return (
    <div
      className={`${newGroup ? styles.newGroup : styles.newGroup__hide} ${
        selectedContacts.length !== 0 ? styles.continue__show : ""
      }`}
    >
      <div className={styles.header}>
        <div className={styles.ctn_header}>
          <div onClick={() => props.setNewGroup(false)}>
            <AiOutlineArrowLeft size="20px" />
          </div>
          <p>Add Group Participants</p>
        </div>
        <div className={styles.input}>
          <div className={styles.searched_contacts}>
            {selectedContacts.length !== 0 &&
              (selectedContacts as User[]).map(ctx => (
                <div className={styles.searched_contact} key={ctx._id}>
                  <img
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
                  <div
                    className={styles.cancel}
                    onClick={() => {
                      props.setSelectedContacts(
                        selectedContacts.filter(ct => ct._id !== ctx._id)
                      );
                      !contacts?.find(us => us._id === ctx._id) &&
                        setContacts(ct => [ctx, ...(ct || [])]);
                    }}
                  >
                    <span>&nbsp;</span>
                  </div>
                </div>
              ))}
          </div>
          <input
            type="text"
            placeholder="Type contact name"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <span className={styles.input_border}>&nbsp;</span>
        </div>
      </div>
      <div className={styles.container}>
        <div>
          {contacts &&
            contacts.length !== 0 &&
            (contacts as User[])
              .filter(us => `${us.firstName}${us.lastName}`.includes(input))
              .map(user => (
                <div
                  className={styles.contacts}
                  key={user._id}
                  onClick={() => {
                    !selectedContacts.find(us => us._id === user._id) &&
                      props.setSelectedContacts([...selectedContacts, user]);
                    setContacts(contacts.filter(ct => ct._id !== user._id));
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
                      <p>{user.status}</p>
                    </div>
                  </div>
                </div>
              ))}
        </div>
      </div>
      <div className={styles.footer}>
        <div
          className={styles.continue}
          onClick={() => {
            props.setGroupSubject(true);
          }}
        >
          <AiOutlineArrowRight size="25px" color="#fff" />
        </div>
      </div>
    </div>
  );
};

export default connect<{}, Props>(null, dispatch =>
  bindActionCreators(
    { setNewGroup, setGroupSubject, setSelectedContacts },
    dispatch
  )
)(NewGroupContacts);
