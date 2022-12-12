import { axios } from "../../Axios";
import { User } from "../../interfaces/User";
import { FetchCurrentUserAction } from "../../pages/_app";
import { ActionTypes } from "./types";
import Router from "next/router";
import { Dispatch } from "redux";

export interface FetchContactAction {
  type: ActionTypes.fetchContacts;
  payload: User[];
}

export interface AddContactAction {
  type: ActionTypes.addContact;
  payload: User;
}

export const fetchCurrentUser = () => async (dispatch: Dispatch) => {
  try {
    const res = await axios.get<{ currentUser: User | null }>(
      "/api/currentUser"
    );
    dispatch<FetchCurrentUserAction>({
      type: ActionTypes.fetchCurrentUser,
      payload: res.data.currentUser
    });
    Router.push("/");
  } catch (error) {
    console.log(error.response);
  }
};

export const addContact = (user: User): AddContactAction => {
  return {
    type: ActionTypes.addContact,
    payload: user
  };
};

export interface FilterContact {
  type: ActionTypes.filterContacts;
  payload: string;
}

export const filterContact = (text: string): FilterContact => {
  return {
    type: ActionTypes.filterContacts,
    payload: text
  };
};

export interface AddCurrentContact {
  type: ActionTypes.addCurrentContact;
  payload: User;
}

export const addCurrentContact = (user: User): AddCurrentContact => {
  return {
    type: ActionTypes.addCurrentContact,
    payload: user
  };
};

export interface UpdateUser {
  type: ActionTypes.updateUser;
  payload?: User;
}

export const updateUser = (userAttr: User | any) => async (
  dispatch: Dispatch
) => {
  try {
    const res = await axios.post<User>("/api/update/user", userAttr);
    dispatch<UpdateUser>({ type: ActionTypes.updateUser, payload: res.data });
  } catch (error) {
    console.log(error);
  }
};
export interface UpdateUserProfile {
  type:
    | ActionTypes.updateUser
    | ActionTypes.userLoadingStart
    | ActionTypes.userLoadingStop;
  payload?: User;
}
export const updateUserProfile = (userAttr: User | any) => async (
  dispatch: Dispatch
) => {
  try {
    dispatch<UpdateUserProfile>({ type: ActionTypes.userLoadingStart });
    const res = await axios.post<User>("/api/update/user/profile", userAttr);
    dispatch<UpdateUserProfile>({
      type: ActionTypes.updateUser,
      payload: res.data
    });
    dispatch<UpdateUserProfile>({ type: ActionTypes.userLoadingStop });
  } catch (error) {
    dispatch<UpdateUserProfile>({ type: ActionTypes.userLoadingStop });
    console.log(error);
  }
};

export interface UpdateOnline {
  type: ActionTypes.updateOnline;
  payload: User;
}

export const updateOnline = (user: User): UpdateOnline => {
  return {
    type: ActionTypes.updateOnline,
    payload: user
  };
};

export interface UpdateTyping {
  type: ActionTypes.updateTyping;
  payload: User;
}

export const updateTyping = (user: User): UpdateTyping => {
  return {
    type: ActionTypes.updateTyping,
    payload: user
  };
};

export interface ToggleProfile {
  type: ActionTypes.toggleProfile;
  payload: boolean;
}

export const toggleProfile = (toggle: boolean): ToggleProfile => {
  return {
    type: ActionTypes.toggleProfile,
    payload: toggle
  };
};

export interface ToggleContactInfo {
  type: ActionTypes.toggleContactInfo;
  payload: boolean;
}

export const toggleContactInfo = (toggle: boolean): ToggleContactInfo => {
  return {
    type: ActionTypes.toggleContactInfo,
    payload: toggle
  };
};
export interface SetNewChat {
  type: ActionTypes.setNewChat;
  payload: boolean;
}

export const setNewChat = (set: boolean): SetNewChat => {
  return {
    type: ActionTypes.setNewChat,
    payload: set
  };
};

export interface SetForwardTo {
  type: ActionTypes.setForwardTo;
  payload: boolean;
  message?: string;
}

export const setForwardTo = (set: boolean, message?: string): SetForwardTo => {
  return {
    type: ActionTypes.setForwardTo,
    payload: set,
    message
  };
};

export interface ToggleStarredMsgs {
  type: ActionTypes.toggleStarredMsgs;
  payload: boolean;
}

export const toggleStarredMsgs = (set: boolean): ToggleStarredMsgs => {
  return {
    type: ActionTypes.toggleStarredMsgs,
    payload: set
  };
};
