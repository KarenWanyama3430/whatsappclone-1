import styles from "../../styles/contacts.module.css";
import React, { useState } from "react";
import {
  SetNewGroup,
  setNewGroup,
  toggleProfile,
  ToggleProfile,
  ToggleStarredMsgs,
  toggleStarredMsgs
} from "../../redux/actions";
import { connect, useSelector } from "react-redux";
import { Redux } from "../../interfaces/Redux";
import { bindActionCreators } from "redux";
import { axios } from "../../Axios";
import Router from "next/router";

interface Props {
  menuRef: React.RefObject<HTMLDivElement>;
  hideMenu: boolean;
  toggleProfile: (toggle: boolean) => ToggleProfile;
  setNewGroup: (set: boolean) => SetNewGroup;
  toggleStarredMsgs: (set: boolean) => ToggleStarredMsgs;
  logoutLoadingFunc: (loading: boolean) => void;
}
const Box: React.FC<Props> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const showProfile = useSelector<Redux>(
    state => state.user.showProfile
  ) as Redux["user"]["showProfile"];
  return (
    <div
      className={`${styles.profile} ${showProfile && styles.hideBoxMenu} ${
        loading ? styles.loading : ""
      }`}
    >
      <div ref={props.menuRef} className={`${styles.box} ${props.hideMenu && styles.hideMenu}`}>
        <p onClick={() => props.setNewGroup(true)}>New Group</p>

        <p onClick={() => props.toggleProfile(true)}>Profile</p>

        <p onClick={() => props.toggleStarredMsgs(true)}>Starred Messages</p>

        <p
          onClick={async () => {
            try {
              setLoading(true);
              props.logoutLoadingFunc(true);
              await axios.get("/api/logout");
              window.location.replace("/login");
              setLoading(false);
              props.logoutLoadingFunc(false);
            } catch (error) {
              window.location.reload();
              setLoading(false);
              props.logoutLoadingFunc(false);
            }
          }}
        >
          Logout
        </p>
      </div>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators({ toggleProfile, setNewGroup, toggleStarredMsgs }, dispatch)
)(Box);
