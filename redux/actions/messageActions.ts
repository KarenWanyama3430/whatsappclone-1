import { Dispatch } from "redux";
import { axios } from "../../Axios";
import { Message } from "../../interfaces/Message";
import { Redux } from "../../interfaces/Redux";
import { User } from "../../interfaces/User";
import { io } from "../../pages";
import { ActionTypes } from "./types";

export interface FetchMessages {
  type:
    | ActionTypes.fetchMessages
    | ActionTypes.messagesLoadingStart
    | ActionTypes.messagesLoadingStop;
  payload?: Message[] | [];
}

export const fetchMessages = (
  contactId: string,
  count: number,
  resetMsgs?: boolean
) => async (dispatch: Dispatch, getState: () => Redux) => {
  try {
    dispatch<FetchMessages>({ type: ActionTypes.messagesLoadingStart });
    const showContactInfo = getState().user.showContactInfo;
    if (showContactInfo) {
      getState().user.showContactInfo = false;
    }
    let skip;
    let limit;
    if (resetMsgs) {
      getState().message.messages = null;
    }
    if (!getState().message.messages) {
      skip = count - 20;
      if (skip <= 0) {
        skip = count;
      }
      limit = 20;
    }
    if (getState().message.messages) {
      skip = count - (getState().message.messages!.length + 20);
      limit = 20;
    }
    if (typeof skip === "number" && skip < 20 && skip >= 0) {
      limit = skip + 20;
      skip = 0;
    }
    if (typeof skip === "number" && skip < 0) {
      return;
    }

    const res = await axios.post<FetchMessages["payload"]>(
      `/api/messages/${contactId}`,
      {
        skip,
        limit
      }
    );
    dispatch<FetchMessages>({
      type: ActionTypes.fetchMessages,
      payload: res.data
    });
    dispatch<FetchMessages>({ type: ActionTypes.messagesLoadingStop });
  } catch (error) {
    console.log(error.response);
  }
};

export interface CountUserMsgs {
  type:
    | ActionTypes.countUserMsgs
    | ActionTypes.usrCountLoadingStart
    | ActionTypes.usrCountLoadingStop;
  payload?: number;
}

export const countUserMsgs = (userId: string) => async (
  dispatch: Dispatch,
  getState: () => Redux
) => {
  dispatch<CountUserMsgs>({ type: ActionTypes.usrCountLoadingStart });
  const res = await axios.get<{ count: number }>(
    `/api/count/messages/${userId}`
  );
  if (getState().user.currentContact) {
    getState().message.messages = null;
  }
  // @ts-ignore
  dispatch(fetchMessages(userId, res.data.count));
  dispatch<CountUserMsgs>({
    type: ActionTypes.countUserMsgs,
    payload: res.data.count
  });
  dispatch<CountUserMsgs>({ type: ActionTypes.usrCountLoadingStop });
};
export interface AddNewMessage {
  type: ActionTypes.addNewMessage;
  payload:
    | Message
    | {
        message: string | null;
        to: User;
        from: User;
        createdAt: string;
      };
  currentContact: User | null;
  currentUser: User | null;
}

export const addNewMessage = (
  message:
    | Message
    | {
        message: string | null;
        to: User;
        from: User;
        createdAt: string;
      }
) => (dispatch: Dispatch, getState: () => Redux) => {
  dispatch<AddNewMessage>({
    type: ActionTypes.addNewMessage,
    payload: message,
    currentContact: getState().user.currentContact,
    currentUser: getState().user.currentUser
  });
};

export interface UpdateLastMsg {
  type: ActionTypes.updateLastMsg;
  payload: Message;
}

export const updateLastMsg = (message: Message): UpdateLastMsg => {
  return {
    type: ActionTypes.updateLastMsg,
    payload: message
  };
};

export interface FilterRecentChats {
  type: ActionTypes.filterRecentChats;
  payload: string;
}

export const filterRecentChats = (text: string): FilterRecentChats => {
  return {
    type: ActionTypes.filterRecentChats,
    payload: text
  };
};

export interface UpdateRead {
  type: ActionTypes.updateRead;
  payload: Message[];
}

export const updateRead = (msgIds: string[]) => async (
  dispatch: Dispatch,
  getState: () => Redux
) => {
  await axios.post("/api/update/read", {
    msgIds,
    currentContact: getState().user.currentContact?._id,
    currentUser: getState().user.currentUser?._id
  });
  io.on("read", (data: { action: string; messages: Message[] }) => {
    if (data.action === "change") {
      dispatch<UpdateRead>({
        type: ActionTypes.updateRead,
        payload: data.messages
      });
    }
  });
};

export interface UpdateSecondTick {
  type: ActionTypes.updateSecondTick;
  payload: Message[];
}

export const updateSecondTick = (msgIds: string[]) => async (
  dispatch: Dispatch,
  getState: () => Redux
) => {
  await axios.post("/api/update/second_tick", {
    msgIds,
    currentContact: getState().user.currentContact?._id,
    currentUser: getState().user.currentUser?._id
  });
  io.on("secondTick", (data: { action: string; messages: Message[] }) => {
    if (data.action === "change") {
      dispatch<UpdateSecondTick>({
        type: ActionTypes.updateSecondTick,
        payload: data.messages
      });
    }
  });
};

export interface SetDisplay {
  type: ActionTypes.setDisplay;
  payload: boolean;
}

export const setDisplay = (display: boolean): SetDisplay => {
  return {
    type: ActionTypes.setDisplay,
    payload: display
  };
};

export interface ToggleSearchMessage {
  type: ActionTypes.toggleSearchMessage;
  payload: boolean;
}

export const toggleSearchMessage = (toggle: boolean): ToggleSearchMessage => {
  return {
    type: ActionTypes.toggleSearchMessage,
    payload: toggle
  };
};

export interface ScrollMessage {
  type: ActionTypes.scrollMessage;
  payload: Message;
}

export const setScrollMessage = (msg: Message): ScrollMessage => {
  return {
    type: ActionTypes.scrollMessage,
    payload: msg
  };
};

export interface SetShowMessageInfo {
  type: ActionTypes.setShowMessageInfo;
  payload: Message | null;
}

export const setShowMessageInfo = (msg: Message | null): SetShowMessageInfo => {
  return {
    type: ActionTypes.setShowMessageInfo,
    payload: msg
  };
};

export interface ResetMsgCount {
  type: ActionTypes.resetMsgCount;
  payload: string;
}

export const resetMsgCount = (chatId: string): ResetMsgCount => {
  return {
    type: ActionTypes.resetMsgCount,
    payload: chatId
  };
};

export interface SetPrompt {
  type: ActionTypes.setPrompt;
  payload: boolean;
}

export const setPrompt = (set: boolean): SetPrompt => {
  return {
    type: ActionTypes.setPrompt,
    payload: set
  };
};

export interface ClearChat {
  type: ActionTypes.clearChat;
  payload: string;
}

export const clearChat = (id: string) => (
  dispatch: Dispatch,
  getState: () => Redux
) => {
  getState().user.currentContact = null;
  getState().user.showContactInfo = false;
  getState().message.showSearchMessage = false;

  dispatch<ClearChat>({
    type: ActionTypes.clearChat,
    payload: id
  });
};

export interface DeleteMessage {
  type: ActionTypes.deleteMessage;
  payload: string;
}
export const deleteMessage = (msgId: string): DeleteMessage => {
  return {
    type: ActionTypes.deleteMessage,
    payload: msgId
  };
};
