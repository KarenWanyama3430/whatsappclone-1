import { BsCheck, BsCheckAll } from "react-icons/bs";
import { Group } from "../../interfaces/Group";
import { GroupMsg } from "../../interfaces/GroupMsg";

interface Props {
  grpMsg: GroupMsg;
  currentGroup: Group | null;
}

const RenderTick: React.FC<Props> = ({ grpMsg, currentGroup }) => {
  if (
    grpMsg.read &&
    grpMsg.readBy?.length === currentGroup!.participants.length - 1
  ) {
    return (
      <BsCheckAll
        size="17px"
        style={{ transform: "rotate(-10deg)" }}
        color="#4fc3f7"
      />
    );
  }
  if (
    grpMsg.deliveredTo &&
    grpMsg.deliveredTo.length === currentGroup!.participants.length - 1
  ) {
    return (
      <BsCheckAll
        size="17px"
        style={{ transform: "rotate(-10deg)" }}
        color="rgba(0,0,0,.5)"
      />
    );
  }

  if (grpMsg._id) {
    return (
      <BsCheck
        size="17px"
        style={{ transform: "rotate(-10deg)" }}
        color="rgba(0,0,0,.5)"
      />
    );
  }
  return <></>;
};

export default RenderTick;
