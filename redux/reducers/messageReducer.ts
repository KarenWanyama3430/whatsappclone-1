import { Message } from "../../interfaces/Message";
import { AnyAction } from "redux";
import { ActionTypes } from "../actions/types";
import { FetchLastMsg } from "../../pages";
import {
  AddNewMessage,
  ClearChat,
  CountUserMsgs,
  DeleteMessage,
  FetchMessages,
  FilterRecentChats,
  ResetMsgCount,
  ScrollMessage,
  SetDisplay,
  SetPrompt,
  SetShowMessageInfo,
  ToggleSearchMessage,
  UpdateLastMsg,
  UpdateRead,
  UpdateSecondTick
} from "../actions";
import { User } from "../../interfaces/User";

export interface MessageState {
  lastMsgs: Message[] | [] | null;
  messages:
    | Message[]
    | []
    | null
    | {
        message: string | null;
        to: User;
        from: User;
        createdAt: string;
      }[];
  messagesLoading: boolean;
  filteredRecentChats: Message[] | [] | null;
  display: boolean;
  showSearchMessage: boolean;
  scrollMessage: Message | null;
  showMessageInfo: Message | null;
  msgCount: number;
  usrCountLoading: boolean;
  prompt: boolean;
}

const INITIAL_STATE: MessageState = {
  lastMsgs: null,
  messages: null,
  messagesLoading: false,
  filteredRecentChats: null,
  display: false,
  showSearchMessage: false,
  scrollMessage: null,
  showMessageInfo: null,
  msgCount: 0,
  usrCountLoading: false,
  prompt: false
};

type Action =
  | FetchLastMsg
  | FetchMessages
  | AddNewMessage
  | UpdateLastMsg
  | FilterRecentChats
  | UpdateRead
  | UpdateSecondTick
  | SetDisplay
  | ToggleSearchMessage
  | ScrollMessage
  | SetShowMessageInfo
  | ResetMsgCount
  | CountUserMsgs
  | SetPrompt
  | ClearChat
  | DeleteMessage;

export const messageReducer = (
  state = INITIAL_STATE,
  action: Action
): MessageState => {
  switch (action.type) {
    case ActionTypes.fetchLastMsg:
      return {
        ...state,
        lastMsgs: action.payload,
        filteredRecentChats: action.payload
      };
    case ActionTypes.fetchMessages:
      if (state.messages) {
        const incomingMsgs = action.payload?.filter(msg => {
          const msgFound = state.messages?.find(
            ms => ms.createdAt === msg.createdAt
          );
          if (msgFound) {
            return false;
          }
          return true;
        });
        return {
          ...state,
          messages: [...incomingMsgs!, ...state.messages]
        };
      }
      return { ...state, messages: action.payload as MessageState["messages"] };
    case ActionTypes.addNewMessage:
      if (
        action.payload.to._id.toString() !==
          action.currentContact?._id.toString() &&
        action.payload.from._id.toString() !==
          action.currentContact?._id.toString()
      ) {
        return state;
      }
      if (
        action.payload.to._id.toString() !==
          action.currentUser?._id.toString() &&
        action.payload.from._id.toString() !==
          action.currentUser?._id.toString()
      ) {
        return state;
      }
      const msgs = [...state.messages!];
      const newMessageExistIdx = state.messages!.findIndex(
        msg => msg.createdAt.toString() === action.payload.createdAt.toString()
      );
      if (newMessageExistIdx !== -1) {
        msgs[newMessageExistIdx] = action.payload;
        return { ...state, messages: msgs };
      }
      if (!state.messages) {
        return {
          ...state,
          messages: [action.payload]
        };
      }

      return {
        ...state,
        messages: [...state.messages, action.payload]
      };
    case ActionTypes.updateLastMsg:
      const newMsgs = [...state.lastMsgs!];

      const filteredItems = newMsgs.filter(
        msg => msg._id!.toString() !== action.payload._id!.toString()
      );
      if (filteredItems.length !== 0) {
        return {
          ...state,
          lastMsgs: [action.payload, ...filteredItems],
          filteredRecentChats: [action.payload, ...filteredItems]
        };
      }
      return {
        ...state,
        lastMsgs: [action.payload],
        filteredRecentChats: [action.payload]
      };
    case ActionTypes.messagesLoadingStart:
      return { ...state, messagesLoading: true };
    case ActionTypes.messagesLoadingStop:
      return { ...state, messagesLoading: false };
    case ActionTypes.filterRecentChats:
      const chats = state.lastMsgs?.filter(msg => {
        const name = `${msg.to.firstName.toLocaleLowerCase()}${msg.to.lastName.toLowerCase()}`;
        return name.toLowerCase().includes(action.payload.toLowerCase());
      }) as Message[] | [];
      return { ...state, filteredRecentChats: chats };
    case ActionTypes.updateRead:
      const stateMsgs = [...state.messages!];
      action.payload.forEach(msg => {
        const msgIndx = (state.messages as Message[]).findIndex(
          m => m._id?.toString() === msg._id?.toString()
        );
        if (msgIndx !== -1) {
          stateMsgs[msgIndx] = msg;
        }
      });
      return { ...state, messages: stateMsgs };
    case ActionTypes.updateSecondTick:
      if (state.messages) {
        const stateSTickMsgs = [...state.messages];
        action.payload.forEach(msg => {
          const msgIndx = (state.messages as Message[]).findIndex(
            m => msg._id && msg._id?.toString() === m._id?.toString()
          );
          if (msgIndx !== -1) {
            stateSTickMsgs[msgIndx] = msg;
          }
        });
        return { ...state, messages: stateSTickMsgs };
      }
      return state;
    case ActionTypes.setDisplay:
      return { ...state, display: action.payload };
    case ActionTypes.toggleSearchMessage:
      return { ...state, showSearchMessage: action.payload };
    case ActionTypes.scrollMessage:
      return { ...state, scrollMessage: action.payload };
    case ActionTypes.setShowMessageInfo:
      return { ...state, showMessageInfo: action.payload };
    case ActionTypes.resetMsgCount:
      const lstMsgs = [...state.lastMsgs!];
      const rstCountIndx = lstMsgs.findIndex(
        msg => msg.chatId === action.payload
      );
      if (rstCountIndx !== -1) {
        lstMsgs[rstCountIndx].count = 0;
      }
      return { ...state, lastMsgs: lstMsgs };
    case ActionTypes.countUserMsgs:
      return { ...state, msgCount: action.payload! };
    case ActionTypes.usrCountLoadingStart:
      return { ...state, usrCountLoading: true };
    case ActionTypes.usrCountLoadingStop:
      return { ...state, usrCountLoading: false };
    case ActionTypes.setPrompt:
      return { ...state, prompt: action.payload };
    case ActionTypes.clearChat:
      return {
        ...state,
        lastMsgs:
          state.lastMsgs &&
          state.lastMsgs!.filter(msg => msg.to._id !== action.payload),
        filteredRecentChats:
          state.lastMsgs &&
          state.lastMsgs!.filter(msg => msg.to._id !== action.payload),
        messages: null
      };
    case ActionTypes.deleteMessage:
      return {
        ...state,
        messages:
          state.messages &&
          (state.messages as Message[]).filter(
            msg => msg._id !== action.payload
          )
      };
    default:
      return state;
  }
};
