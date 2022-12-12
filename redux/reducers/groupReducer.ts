import { Group } from "../../interfaces/Group";
import { GroupMsg } from "../../interfaces/GroupMsg";
import { User } from "../../interfaces/User";
import { FetchAllGroups } from "../../pages";
import {
  AddCurrentGroup,
  AddGroup,
  AddGroupMessage,
  FetchGroupMessages,
  SetGroupChat,
  SetGroupContainer,
  SetGroupDelivered,
  SetGroupDisplay,
  SetGroupInfo,
  SetGroupMsgInfo,
  SetGroupSearch,
  SetGroupSubject,
  SetGrpScrollMsg,
  SetNewGroup,
  SetSelectedContacts,
  SetSelectedInfoMsg,
  SetSelectGroupMessages,
  SetGroupRead,
  CountGrpMsgs,
  EmptyGrpMsgs,
  UpdateGrpDescription,
  DeleteGrpMsg,
  SetGrpPrompt
} from "../actions";
import { ActionTypes } from "../actions/types";

export interface GroupState {
  newGroup: boolean;
  groupSubject: boolean;
  groupContainer: boolean;
  groups: Group[] | [] | null;
  selectedContacts: User[] | [];
  groupMessages: GroupMsg[] | [] | null;
  groupInfo: boolean;
  groupChat: boolean;
  currentGroup: Group | null;
  groupMessageLoading: boolean;
  selectGroupMessages: boolean;
  groupDisplay: boolean;
  groupSearch: boolean;
  grpScrollMsg: GroupMsg | null;
  groupMessageInfo: boolean;
  selectedInfoMsg: GroupMsg | null;
  grpMsgCount: number;
  grpMsgCountLoading: boolean;
  grpPrompt: boolean;
}

const INITIAL_STATE: GroupState = {
  newGroup: false,
  groupSubject: false,
  groupContainer: false,
  groups: null,
  selectedContacts: [],
  groupMessages: null,
  groupInfo: false,
  groupChat: false,
  currentGroup: null,
  groupMessageLoading: false,
  selectGroupMessages: false,
  groupDisplay: false,
  groupSearch: false,
  grpScrollMsg: null,
  groupMessageInfo: false,
  selectedInfoMsg: null,
  grpMsgCount: 0,
  grpMsgCountLoading: false,
  grpPrompt: false
};

type Action =
  | SetNewGroup
  | SetGroupSubject
  | SetGroupContainer
  | FetchAllGroups
  | AddGroup
  | SetSelectedContacts
  | FetchGroupMessages
  | AddGroupMessage
  | SetGroupInfo
  | SetGroupChat
  | AddCurrentGroup
  | SetSelectGroupMessages
  | SetGroupDisplay
  | SetGroupRead
  | SetGroupSearch
  | SetGrpScrollMsg
  | SetGroupMsgInfo
  | SetSelectedInfoMsg
  | SetGroupDelivered
  | CountGrpMsgs
  | EmptyGrpMsgs
  | UpdateGrpDescription
  | DeleteGrpMsg
  | SetGrpPrompt;

export const groupReducer = (
  state = INITIAL_STATE,
  action: Action
): GroupState => {
  switch (action.type) {
    case ActionTypes.setNewGroup:
      return { ...state, newGroup: action.payload };
    case ActionTypes.setGroupSubject:
      return { ...state, groupSubject: action.payload };
    case ActionTypes.setGroupContainer:
      return { ...state, groupContainer: action.payload };
    case ActionTypes.fetchAllGroups:
      if (action.left && state.currentGroup) {
        const currGrp = action.payload.find(
          grp => grp._id === state.currentGroup?._id
        );
        if (currGrp) {
          return { ...state, groups: action.payload };
        }
        return {
          ...state,
          groups: action.payload,
          groupMessages: null,
          currentGroup: null
        };
      }
      return { ...state, groups: action.payload };
    case ActionTypes.addGroup:
      const found = state.groups?.find(
        grp => grp._id.toString() === action.payload._id.toString()
      );

      if (found) {
        if (
          state.groupMessages &&
          state.groupMessages[state.groupMessages.length - 1].from._id !==
            action.currentUser._id &&
          state.currentGroup?._id === action.payload._id
        ) {
          action.payload.count = found.count + 1;
        }
        if (!state.groupMessages) {
          action.payload.count = found.count + 1;
        }
        if (
          state.currentGroup?._id !== action.payload._id &&
          state.groupMessages
        ) {
          action.payload.count = found.count + 1;
        }
        const filteredGroups = state.groups?.filter(
          grp => grp._id !== found._id
        );

        return {
          ...state,
          groups: [action.payload, ...(filteredGroups || [])]
        };
      }
      return { ...state, groups: [action.payload, ...(state.groups || [])] };
    case ActionTypes.setSelectedContacts:
      return { ...state, selectedContacts: action.payload };
    case ActionTypes.fetchGroupMessages:
      const grps = [...(state.groups || [])];
      const grpIndx = grps.findIndex(
        grp => grp._id === state.currentGroup?._id
      );
      grps[grpIndx].count = 0;
      if (state.groupMessages) {
        const incomingMsgs = action.payload.filter(msg => {
          const found = state.groupMessages?.find(ms => ms._id === msg._id);
          if (found) {
            return false;
          }
          return true;
        });
        return {
          ...state,
          groupMessages: [...incomingMsgs, ...state.groupMessages],
          groups: grps
        };
      }
      return { ...state, groupMessages: action.payload, groups: grps };
    case ActionTypes.addGroupMessage:
      if (
        state.currentGroup &&
        state.currentGroup._id === action.payload.group._id
      ) {
        if (state.groupMessages) {
          const msgExistsIndx = state.groupMessages.findIndex(
            msg => msg.createdAt === action.payload.createdAt
          );
          if (msgExistsIndx !== -1) {
            const grpMsgs = [...state.groupMessages];
            grpMsgs.splice(msgExistsIndx, 1);
            return { ...state, groupMessages: [...grpMsgs, action.payload] };
          }

          return {
            ...state,
            groupMessages: [...state.groupMessages, action.payload]
          };
        }
        return { ...state, groupMessages: [action.payload] };
      }
      return { ...state };
    case ActionTypes.setGroupInfo:
      return { ...state, groupInfo: action.payload };
    case ActionTypes.setGroupChat:
      return { ...state, groupChat: action.payload };
    case ActionTypes.addCurrentGroup:
      return { ...state, currentGroup: action.payload };
    case ActionTypes.groupMessagesLoadingStart:
      return { ...state, groupMessageLoading: true };
    case ActionTypes.groupMessagesLoadingStop:
      return { ...state, groupMessageLoading: false };
    case ActionTypes.setSelectGroupMessages:
      return { ...state, selectGroupMessages: action.payload };
    case ActionTypes.setGroupDisplay:
      return { ...state, groupDisplay: action.payload };
    case ActionTypes.setGroupRead:
      if (state.groupMessages) {
        const grpMsgs = [...state.groupMessages];
        action.payload.forEach(msg => {
          const msgIndx = state.groupMessages!.findIndex(
            m => m._id === msg._id
          );
          if (msgIndx !== -1) {
            grpMsgs[msgIndx] = msg;
          }
        });
        return { ...state, groupMessages: grpMsgs };
      }
      return { ...state };
    case ActionTypes.setGroupSearch:
      return { ...state, groupSearch: action.payload };
    case ActionTypes.setGrpScrollMsg:
      return { ...state, grpScrollMsg: action.payload };
    case ActionTypes.setGroupMsgInfo:
      return { ...state, groupMessageInfo: action.payload };
    case ActionTypes.setSelectedInfoMsg:
      const selectedMsg = state.groupMessages?.find(
        msg => msg._id === action.payload
      );
      return { ...state, selectedInfoMsg: selectedMsg! };
    case ActionTypes.setGroupDelivered:
      if (state.currentGroup) {
        const userInGroup = state.currentGroup.participants.find(
          usr => usr._id === action.payload._id
        );
        if (
          userInGroup &&
          state.groupMessages &&
          state.groupMessages.length !== 0
        ) {
          const updatedMsgs = (state.groupMessages as GroupMsg[]).map(msg => {
            const deliveredTo =
              msg.deliveredTo &&
              msg.deliveredTo.find(usr => usr.user._id === action.payload._id);
            if (deliveredTo) {
              return msg;
            }
            const { _id, deliveredDate, firstName, lastName } = action.payload;
            if (msg.deliveredTo) {
              return {
                ...msg,
                deliveredTo: [
                  ...msg.deliveredTo,
                  { user: { firstName, lastName, _id }, deliveredDate }
                ]
              };
            }
            return {
              ...msg,
              deliveredTo: [
                { user: { firstName, lastName, _id }, deliveredDate }
              ]
            };
          });
          return { ...state, groupMessages: updatedMsgs };
        }
      }
      return { ...state };
    case ActionTypes.countGrpMsgs:
      return { ...state, grpMsgCount: action.payload! };
    case ActionTypes.grpCountLoadingStart:
      return { ...state, grpMsgCountLoading: true };
    case ActionTypes.grpCountLoadingStop:
      return { ...state, grpMsgCountLoading: false };
    case ActionTypes.emptyGrpMsgs:
      return { ...state, groupMessages: null };
    case ActionTypes.updateGrpDescription:
      if (state.currentGroup && state.currentGroup._id === action.payload._id) {
        return { ...state, currentGroup: action.payload };
      }
      return { ...state };
    case ActionTypes.deleteGrpMsg:
      return {
        ...state,
        groupMessages:
          state.groupMessages?.filter(msg => msg._id !== action.payload) || []
      };
    case ActionTypes.setGrpPrompt:
      return { ...state, grpPrompt: action.payload };
    default:
      return state;
  }
};
