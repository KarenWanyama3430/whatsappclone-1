import { formatDistance, formatRelative } from "date-fns";
import React from "react";
import { BsCheck, BsCheckAll } from "react-icons/bs";
import { connect, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { Message } from "../../interfaces/Message";
import { Redux } from "../../interfaces/Redux";
import { setShowMessageInfo, SetShowMessageInfo } from "../../redux/actions";
import styles from "../../styles/messageInfo.module.css";

interface Props {
  setShowMessageInfo: (msg: Message | null) => SetShowMessageInfo;
}

const MessageInfo: React.FC<Props> = props => {
  const showMessageInfo = useSelector(
    (state: Redux) => state.message.showMessageInfo
  ) as Redux["message"]["showMessageInfo"];
  const currentUser = useSelector(
    (state: Redux) => state.user.currentUser
  ) as Redux["user"]["currentUser"];
  const renderTick = (msg: Message): JSX.Element => {
    if (currentUser?._id.toString() === msg.from._id.toString() && msg.read) {
      return (
        <BsCheckAll
          size="17px"
          style={{ transform: "rotate(-10deg)" }}
          color="#4fc3f7"
        />
      );
    }
    if (
      currentUser?._id.toString() === msg.from._id.toString() &&
      !msg.read &&
      msg.secondTick
    ) {
      return (
        <BsCheckAll
          size="17px"
          style={{ transform: "rotate(-10deg)" }}
          color="rgba(0,0,0,.5)"
        />
      );
    }
    if (
      currentUser?._id.toString() === msg.from._id.toString() &&
      !msg.read &&
      !msg.secondTick
    ) {
      return (
        <BsCheck
          size="17px"
          style={{ transform: "rotate(-10deg)" }}
          color="rgba(0,0,0,.5)"
        />
      );
    }

    return <span></span>;
  };
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <p
          className={styles.rotate}
          onClick={() => props.setShowMessageInfo(null)}
        >
          <div className={styles.x_1}>&nbsp;</div>
        </p>
        <p>Message Info</p>
      </div>
      <div className={styles.message}>
        <p>
          <span>{showMessageInfo?.message}</span>
          <span className={styles.metadata}>
            <span>
              {formatDistance(new Date(showMessageInfo!.createdAt), Date.now())}
            </span>
            <span>{renderTick(showMessageInfo!)}</span>
          </span>
        </p>
      </div>
      <div className={styles.message_info}>
        <div>
          <p>
            <span>
              <BsCheckAll
                size="17px"
                style={{ transform: "rotate(-10deg)" }}
                color="#4fc3f7"
              />
            </span>
            <span>Read</span>
          </p>
          <p className={styles.time}>
            {showMessageInfo?.readDate ? (
              formatRelative(new Date(showMessageInfo!.readDate), Date.now())
            ) : (
              <span>-</span>
            )}
          </p>
        </div>
        <div>
          <p>
            <span>
              <BsCheckAll
                size="17px"
                style={{ transform: "rotate(-10deg)" }}
                color="rgba(0,0,0,.5)"
              />
            </span>
            <span>Delivered</span>
          </p>
          <p className={styles.time}>
            {showMessageInfo?.deliveredDate ? (
              formatRelative(
                new Date(showMessageInfo!.deliveredDate),
                Date.now()
              )
            ) : (
              <span>-</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators({ setShowMessageInfo }, dispatch)
)(MessageInfo);
