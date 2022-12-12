import {
  AnyAction,
  applyMiddleware,
  CombinedState,
  combineReducers,
  createStore,
  Store,
  StoreEnhancer
} from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk, { ThunkMiddleware } from "redux-thunk";
import { reducer as formReducer } from "redux-form";
import { userReducer } from "./reducers/userReducer";
import { Redux } from "../interfaces/Redux";
import { Reducer, useMemo } from "react";
import { messageReducer } from "./reducers/messageReducer";
import { groupReducer } from "./reducers/groupReducer";

const combinedReducer = combineReducers<Reducer<CombinedState<Redux>, AnyAction>>({
  form: formReducer,
  user: userReducer,
  message: messageReducer,
  group: groupReducer
});

let store: Store | undefined;
const reducer = (state: any, action: AnyAction) => {
  return combinedReducer(state, action);
};

const initStore = (preloadedState = {}) => {
  return createStore(reducer, preloadedState, composeWithDevTools(applyMiddleware(thunk)));
};

export const initializeStore = (preloadedState?: {}) => {
  let _store = store ?? initStore(preloadedState);
  if (preloadedState && store) {
    _store = initStore({ ...store.getState(), ...preloadedState });
    store = undefined;
  }
  if (typeof window === "undefined") return _store;
  if (!store) store = _store;
  return _store;
};

export const useStore = (initialState: {}) => {
  const store = useMemo(() => initializeStore(initialState), [initialState]);
  return store;
};
