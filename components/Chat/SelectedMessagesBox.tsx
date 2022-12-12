import { useState } from "react";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { BsInfoCircleFill } from "react-icons/bs";
import { IoMdShareAlt } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { axios } from "../../Axios";
import { Message } from "../../interfaces/Message";
import { User } from "../../interfaces/User";
import {
  fetchCurrentUser,
  SetForwardTo,
  setForwardTo,
  setShowMessageInfo,
  SetShowMessageInfo
} from "../../redux/actions";
import styles from "../../styles/chat.module.css";
import Loading from "../Loading";

interface Props {
  setSelectMessages: React.Dispatch<React.SetStateAction<boolean>>;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  messages: Message[] | [] | null;
  currentUser: User | null;
  setShowMessageInfo: (msg: Message | null) => SetShowMessageInfo;
  setForwardTo: (set: boolean, message?: string) => SetForwardTo;
  fetchCurrentUser: () => void;
}
const SelectedMessagesBox = (props: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const starMessage = async (data: {
    starredMessage: string[];
  }): Promise<void> => {
    try {
      setLoading(true);
      await axios.post("/api/star/message", data);
      props.fetchCurrentUser();
      props.setSelectMessages(false);
      props.setSelected([]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error.response);
    }
  };
  const unstarMessage = async (data: {
    starredMessage: string;
  }): Promise<void> => {
    try {
      setLoading(true);
      await axios.post("/api/unstar/message", data);
      props.fetchCurrentUser();
      props.setSelectMessages(false);
      props.setSelected([]);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error.response);
    }
  };
  const deleteMessage = async (msgId: string) => {
    if (
      props.messages!.some(
        msg => msg._id === msgId && msg.from._id === props.currentUser?._id
      )
    ) {
      try {
        setLoading(true);
        await axios.delete(`/api/delete/message/${msgId}`);
        props.setSelectMessages(false);
        props.setSelected([]);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error.response);
      }
    }
  };
  if (loading) {
    return <Loading />;
  }
  return (
    <div className={`${styles.selected_msgs} `}>
      <p
        onClick={() => {
          props.setSelectMessages(false);
          props.setSelected([]);
          props.setShowMessageInfo(null);
        }}
      >
        <span>&nbsp;</span>
      </p>
      <p>{props.selected.length} selected</p>
      <p
        onClick={() =>
          props.messages &&
          props.selected.length === 1 &&
          props.setShowMessageInfo(
            props.messages.find(
              msg => msg._id?.toString() === props.selected[0]
            ) as Message
          )
        }
      >
        <BsInfoCircleFill
          size="25px"
          color={`${
            props.selected.length === 1
              ? `rgba(80, 80, 80)`
              : `rgba(80, 80, 80,.5)`
          } `}
          style={{
            cursor: `${props.selected.length === 1 ? "pointer" : "default"}`
          }}
        />
      </p>
      {props.selected.length === 1 &&
      props.currentUser?.starredMessages.includes(props.selected[0]) ? (
        <p
          onClick={() =>
            props.selected.length === 1 &&
            unstarMessage({ starredMessage: props.selected[0] })
          }
        >
          <AiFillStar
            size="25px"
            color={`${
              props.selected.length === 1
                ? `rgba(80, 80, 80)`
                : `rgba(80, 80, 80,.5)`
            } `}
            style={{
              cursor: `${props.selected.length === 1 ? "pointer" : "default"}`
            }}
          />
        </p>
      ) : (
        <p
          onClick={() =>
            props.selected.length !== 0 &&
            starMessage({
              starredMessage: props.selected.filter(msg => {
                const starred = props.currentUser?.starredMessages.includes(
                  msg
                );
                if (starred) {
                  return false;
                }
                return true;
              })
            })
          }
        >
          <AiOutlineStar
            size="25px"
            color={`${
              props.selected.length !== 0
                ? `rgba(80, 80, 80)`
                : `rgba(80, 80, 80,.5)`
            } `}
            style={{
              cursor: `${props.selected.length !== 0 ? "pointer" : "default"}`
            }}
          />
        </p>
      )}
      <p
        onClick={() =>
          props.selected.length !== 0 && deleteMessage(props.selected[0])
        }
      >
        <MdDelete
          size="25px"
          color={`${
            props.selected.length === 1
              ? `rgba(80, 80, 80)`
              : `rgba(80, 80, 80,.5)`
          } `}
          style={{
            cursor: `${props.selected.length === 1 ? "pointer" : "default"}`
          }}
        />
      </p>
      <p
        onClick={() =>
          props.selected.length === 1 &&
          props.setForwardTo(
            true,
            props.messages?.find(
              msg => msg._id && msg._id === props.selected[0]
            )?.message
          )
        }
      >
        <IoMdShareAlt
          size="25px"
          color={`${
            props.selected.length === 1
              ? `rgba(80, 80, 80)`
              : `rgba(80, 80, 80,.5)`
          } `}
          style={{
            cursor: `${props.selected.length === 1 ? "pointer" : "default"}`
          }}
        />
      </p>
    </div>
  );
};

export default connect(null, dispatch =>
  bindActionCreators(
    { setShowMessageInfo, setForwardTo, fetchCurrentUser },
    dispatch
  )
)(SelectedMessagesBox);
