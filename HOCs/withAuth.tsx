import { Redux } from "../interfaces/Redux";
import { AnyAction, Store } from "redux";
import { GetServerSidePropsContext } from "next-redux-wrapper";
import { axios } from "../Axios";
import { FetchCurrentUserAction } from "../pages/_app";
import { ActionTypes } from "../redux/actions/types";

export const withAuth = async (ctx: GetServerSidePropsContext, store: Store<any, AnyAction>) => {
  try {
    const res = await axios.get("/api/currentUser", {
      headers: ctx.req?.headers
    });
    store.dispatch<FetchCurrentUserAction>({
      type: ActionTypes.fetchCurrentUser,
      payload: res.data.currentUser
    });
    if (!res.data.currentUser) {
      return false;
    }
    return true;
  } catch (error) {
    return false;
  }
};
