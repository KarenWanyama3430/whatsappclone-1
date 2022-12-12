import React from "react";
import { connect, useSelector } from "react-redux";
import { IoIosArrowForward, IoMdThumbsDown } from "react-icons/io";
import {
  SetPrompt,
  setPrompt,
  toggleContactInfo,
  ToggleContactInfo
} from "../../redux/actions";
import styles from "../../styles/contactinfo.module.css";
import { MdDelete } from "react-icons/md";
import { BiBlock } from "react-icons/bi";
import { Redux } from "../../interfaces/Redux";
import { formatRelative } from "date-fns";
import { bindActionCreators } from "redux";
import { ImageGroup } from "semantic-ui-react";

interface Props {
  toggleContactInfo: (toggle: boolean) => ToggleContactInfo;
  setPrompt: (set: boolean) => SetPrompt;
}
const ContactInfo: React.FC<Props> = props => {
  const currentContact = useSelector(
    (state: Redux) => state.user.currentContact
  );
  return (
    <div className={styles.container}>
      <div className={styles.contactinfo_header}>
        <p
          className={styles.rotate}
          onClick={() => props.toggleContactInfo(false)}
        >
          <span className={styles.x_1}>&nbsp;</span>
        </p>
        <p>Contact Info</p>
      </div>
      <div className={styles.profile_info}>
        {/* <ImageGroup
          unsized
          src={`http://gravatar.com/avatar/${
            currentContact?._id || Math.random()
          }?d=identicon`}
          alt="pfp"
          className={styles.profile_img}
        /> */}
        <img
          src={`http://gravatar.com/avatar/${
            currentContact?._id || Math.random()
          }?d=identicon`}
          alt="pfp"
          className={styles.profile_img}
        />
        <div className={styles.nameInfo}>
          <h1>
            {currentContact?.firstName} {currentContact?.lastName}
          </h1>
          <p className={styles.lastSeen}>
            {currentContact?.lastSeen
              ? `Last seen ${formatRelative(
                  new Date(currentContact.lastSeen),
                  Date.now()
                )}`
              : ""}
          </p>
        </div>
      </div>

      <div className={`${styles.noti} ${styles.action}`}>
        <p className={styles.a_e}>About and Email</p>
        <span className={styles.status}>{currentContact?.status}</span>
        <span className={styles.border}>&nbsp;</span>
        <p className={styles.email}>{currentContact?.email}</p>
      </div>
      <div className={styles.danger}>
        <div>
          <BiBlock color="rgb(80, 80, 80)" />
        </div>
        <p>Block</p>
      </div>
      <div
        className={styles.danger}
        style={{ color: "rgb(247, 3, 3)" }}
        onClick={() => props.setPrompt(true)}
      >
        <div>
          <MdDelete color="rgb(247, 3, 3)" />
        </div>
        <p>Clear Chat</p>
      </div>
      <div className={styles.end}>&nbsp;</div>
    </div>
  );
};

export default connect<{}, Props>(null, dispatch =>
  bindActionCreators({ toggleContactInfo, setPrompt }, dispatch)
)(ContactInfo);
