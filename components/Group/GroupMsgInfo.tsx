import { formatRelative } from "date-fns";
import React from "react";
import { BsCheckAll } from "react-icons/bs";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { Redux } from "../../interfaces/Redux";
import { SetGroupMsgInfo, setGroupMsgInfo } from "../../redux/actions";
import styles from "../../styles/groupMessageInfo.module.css";
import { formatDistance } from "date-fns";

interface Props {
  setGroupMsgInfo: (set: boolean) => SetGroupMsgInfo;
}

const GroupMsgInfo: React.FC<Props> = props => {
  const groupMessageInfo = useSelector(
    (state: Redux) => state.group.groupMessageInfo
  );
  const selectedInfoMsg = useSelector(
    (state: Redux) => state.group.selectedInfoMsg
  );
  const currentUser = useSelector((state: Redux) => state.user.currentUser);
  const deliveredTo = selectedInfoMsg?.deliveredTo?.filter(usr => {
    const read = selectedInfoMsg.readBy?.find(
      us => us.user._id === usr.user._id
    );
    if (read) {
      return false;
    }
    return true;
  });
  return (
    <div className={groupMessageInfo ? styles.groupMessageInfo : ""}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div
            className={styles.cancel}
            onClick={() => props.setGroupMsgInfo(false)}
          >
            <p>&nbsp;</p>
          </div>
          <p>Message Info</p>
        </div>
        <div className={styles.body}>
          <div className={styles.message}>
            <div>
              <p>{selectedInfoMsg?.message}</p>
              <p className={styles.msg_date}>
                {formatDistance(
                  new Date(selectedInfoMsg!.createdAt),
                  Date.now()
                )}
              </p>
            </div>
          </div>
          <div className={styles.info}>
            <div className={styles.readByHeader}>
              <p>Read by</p>
              <BsCheckAll
                size="17px"
                style={{ transform: "rotate(-10deg)" }}
                color="#4fc3f7"
              />
            </div>
            <div className={styles.readBy}>
              {selectedInfoMsg!.readBy &&
              selectedInfoMsg?.readBy.length !== 0 ? (
                selectedInfoMsg?.readBy.map(
                  ctx =>
                    ctx.user._id !== currentUser?._id && (
                      <div className={styles.contact} key={ctx.user._id}>
                        <img
                          className={styles.profile_img}
                          src={`http://gravatar.com/avatar/${
                            ctx.user?._id || Math.random()
                          }?d=identicon`}
                          alt=""
                        />
                        <div>
                          <p className={styles.name}>
                            {ctx.user.firstName} {ctx.user.lastName}
                          </p>
                          <p className={styles.date}>
                            {formatRelative(new Date(ctx.readDate), Date.now())}
                          </p>
                        </div>
                      </div>
                    )
                )
              ) : (
                <div style={{ transform: "translateX(3rem)" }}>-</div>
              )}
            </div>
            <div className={styles.deliveredToHeader}>
              <p>Delivered to</p>
              <BsCheckAll
                size="17px"
                style={{ transform: "rotate(-10deg)" }}
                color="rgba(0,0,0,.5)"
              />
            </div>
            <div className={styles.deliveredTo}>
              {deliveredTo && deliveredTo.length !== 0 ? (
                deliveredTo.map(
                  usr =>
                    usr.user._id !== currentUser?._id && (
                      <div className={styles.contact} key={usr.user._id}>
                        <img
                          className={styles.profile_img}
                          src={`http://gravatar.com/avatar/${
                            usr.user?._id || Math.random()
                          }?d=identicon`}
                          alt=""
                        />
                        <div>
                          <p className={styles.name}>
                            {usr.user.firstName} {usr.user.lastName}
                          </p>
                          <p className={styles.date}>
                            {formatRelative(
                              new Date(usr.deliveredDate),
                              Date.now()
                            )}
                          </p>
                        </div>
                      </div>
                    )
                )
              ) : (
                <div style={{ transform: "translateX(3rem)" }}></div>
              )}
            </div>
          </div>
        </div>
      </div>
      ;
    </div>
  );
};

export default connect<{}, Props>(null, dispatch =>
  bindActionCreators({ setGroupMsgInfo }, dispatch)
)(GroupMsgInfo);
