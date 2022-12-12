import { FormStateMap } from "redux-form";
import { GroupState } from "../redux/reducers/groupReducer";
import { MessageState } from "../redux/reducers/messageReducer";
import { UserState } from "../redux/reducers/userReducer";

export interface Redux {
  form: FormStateMap;
  user: UserState;
  message: MessageState;
  group: GroupState;
}
