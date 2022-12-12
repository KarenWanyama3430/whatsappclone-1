import React, { useEffect, useRef, useState } from "react";
import { BsCheck } from "react-icons/bs";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { RiPencilFill } from "react-icons/ri";
import { useSelector, connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Redux } from "../../interfaces/Redux";
import { User } from "../../interfaces/User";
import {
  toggleProfile,
  ToggleProfile,
  updateUserProfile
} from "../../redux/actions";
import styles from "../../styles/profile.module.css";

interface Props {
  toggleProfile: (toggle: boolean) => ToggleProfile;
  updateUserProfile: (userAttrs: User | any) => void;
}

const Profile: React.FC<Props> = props => {
  const [firstName, setFirstName] = useState<string>("");
  const [firstNameFocused, setFirstNameFocused] = useState<boolean>(false);
  const [lastName, setLastName] = useState<string>("");
  const [lastNameFocused, setLastNameFocused] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("");
  const [statusFocused, setStatusFocused] = useState<boolean>(false);
  const showProfile = useSelector<Redux>(
    state => state.user.showProfile
  ) as Redux["user"]["showProfile"];
  const currentUser = useSelector<Redux>(
    state => state.user.currentUser
  ) as Redux["user"]["currentUser"];
  const userLoading = useSelector<Redux>(
    state => state.user.userLoading
  ) as Redux["user"]["userLoading"];
  const firstNameRef = useRef<HTMLDivElement>(null);
  const lastNameRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setFirstName(currentUser!.firstName);
    setLastName(currentUser!.lastName);
    setStatus(currentUser!.status);
    document.addEventListener("mousedown", firstNameOutside);
    document.addEventListener("mousedown", lastNameOutside);
    document.addEventListener("mousedown", statusOutside);
    return () => {
      document.removeEventListener("mousedown", firstNameOutside);
      document.removeEventListener("mousedown", lastNameOutside);
      document.removeEventListener("mousedown", statusOutside);
    };
  }, []);
  const firstNameOutside = (e: Event) => {
    if (
      firstNameRef &&
      firstNameRef.current &&
      // @ts-ignore
      !firstNameRef.current.contains(e.target)
    ) {
      setFirstNameFocused(false);
    }
  };
  const lastNameOutside = (e: Event) => {
    if (
      lastNameRef &&
      lastNameRef.current &&
      // @ts-ignore
      !lastNameRef.current.contains(e.target)
    ) {
      setLastNameFocused(false);
    }
  };
  const statusOutside = (e: Event) => {
    if (
      statusRef &&
      statusRef.current &&
      // @ts-ignore
      !statusRef.current.contains(e.target)
    ) {
      setStatusFocused(false);
    }
  };
  return (
    <div className={`${showProfile ? styles.shown : ""}`}>
      <div className={`${styles.container} `}>
        <div onClick={() => props.toggleProfile(false)} className={styles.icon}>
          <div>
            <HiOutlineArrowLeft size="30px" />
          </div>
          <p>profile</p>
        </div>
        <div className={styles.photo}>
          <img
            src={`http://gravatar.com/avatar/${
              currentUser?._id || Math.random()
            }?d=identicon`}
            alt="pfp"
            className={`${styles.img} ${showProfile && styles.img_animate}`}
          />
        </div>
        <div
          className={`${styles.details} ${showProfile && styles.animate} ${
            styles.name_info
          }`}
        >
          <div>
            <h6>First Name</h6>
            <div
              className={`${styles.input} ${
                firstNameFocused ? styles.input_underline : ""
              }`}
              ref={firstNameRef}
            >
              <input
                type="text"
                onChange={e => setFirstName(e.target.value)}
                value={firstName}
                name="firstName"
                id="firstName"
                onFocus={() => setFirstNameFocused(true)}
              />
              <label htmlFor="firstName">
                <BsCheck
                  size="19px"
                  style={{ transform: "rotate(-10deg)" }}
                  color="rgba(0,0,0,.5)"
                  className={
                    firstNameFocused && !userLoading
                      ? styles.BsCheck
                      : styles.hideBsCheck
                  }
                  onClick={() =>
                    firstName.trim().length !== 0 &&
                    props.updateUserProfile({ firstName })
                  }
                />
                {userLoading && firstNameFocused && (
                  <div
                    className={`ui active centered inline loader`}
                    style={{ transform: "translateX(13px)" }}
                  ></div>
                )}
                <RiPencilFill
                  color="rgba(0,0,0,.5)"
                  className={
                    !firstNameFocused && !userLoading
                      ? styles.RiPencilFill
                      : styles.hideRiPencilFill
                  }
                />
              </label>
            </div>
          </div>
          <div>
            <h6>Last Name</h6>
            <div
              className={`${styles.input} ${
                lastNameFocused ? styles.input_underline_last : ""
              }`}
              ref={lastNameRef}
            >
              <input
                type="text"
                onChange={e => setLastName(e.target.value)}
                value={lastName}
                name="lastName"
                id="lastName"
                onFocus={() => setLastNameFocused(true)}
              />
              <label htmlFor="lastName">
                <BsCheck
                  size="19px"
                  style={{ transform: "rotate(-10deg)" }}
                  color="rgba(0,0,0,.5)"
                  className={
                    lastNameFocused && !userLoading
                      ? styles.BsCheck_last
                      : styles.hideBsCheck_last
                  }
                  onClick={() =>
                    lastName.trim().length !== 0 &&
                    props.updateUserProfile({ lastName })
                  }
                />
                {userLoading && lastNameFocused && (
                  <div
                    className={`ui active centered inline loader`}
                    style={{ transform: "translateX(13px)" }}
                  ></div>
                )}
                <RiPencilFill
                  color="rgba(0,0,0,.5)"
                  className={
                    !lastNameFocused && !userLoading
                      ? styles.RiPencilFill_last
                      : styles.hideRiPencilFill_last
                  }
                />
              </label>
            </div>
          </div>
        </div>
        <div className={`${styles.meta} ${showProfile && styles.animate}`}>
          <p style={{ color: "rgba(0,0,0,.5)", fontSize: "1.3rem" }}>
            This name will be visible to your WhatsApp contacts
          </p>
        </div>
        <div className={`${styles.details} ${showProfile && styles.animate}`}>
          <h6>About</h6>
          <div
            ref={statusRef}
            className={`${styles.status} ${
              statusFocused ? styles.status_focused : ""
            }`}
          >
            <input
              type="text"
              onChange={e => setStatus(e.target.value)}
              value={status}
              name="status"
              id="status"
              onFocus={() => setStatusFocused(true)}
              className={styles.details_input}
            />
            <label htmlFor="status">
              <BsCheck
                size="19px"
                style={{
                  transform: "rotate(-10deg) translateY(-10px)",
                  cursor: "pointer"
                }}
                color="rgba(0,0,0,.5)"
                className={
                  statusFocused && !userLoading
                    ? styles.BsCheck_status
                    : styles.hideBsCheck_status
                }
                onClick={() =>
                  status.trim().length !== 0 &&
                  props.updateUserProfile({ status })
                }
              />
              {userLoading && statusFocused && (
                <div
                  className={`ui active centered inline loader`}
                  style={{ transform: "translate(-5px,-12px)" }}
                ></div>
              )}
              <RiPencilFill
                color="rgba(0,0,0,.5)"
                className={
                  !statusFocused && !userLoading
                    ? styles.RiPencilFill_status
                    : styles.hideRiPencilFill_status
                }
                style={{ cursor: "pointer", transform: "translateY(-10px)" }}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators({ toggleProfile, updateUserProfile }, dispatch)
)(Profile);
