import "semantic-ui-css/semantic.min.css";
import App, { AppProps } from "next/app";
import React from "react";
import "../styles/globals.css";
import "../styles/register.css";
import { User } from "../interfaces/User";
import nProgress from "nprogress";
import Router from "next/router";
import Head from "next/head";
import { ActionTypes } from "../redux/actions/types";
import { useStore } from "../redux";
import { Provider } from "react-redux";

interface Props extends AppProps {
  user: User | null;
}

(Router as any).onRouteChangeStart = () => {
  nProgress.start();
};
(Router as any).onRouteChangeComplete = () => nProgress.done();
(Router as any).onRouteChangeError = () => nProgress.done();

function MyApp({ Component, pageProps, user }: Props) {
  const store = useStore(pageProps.initialReduxState);
  return (
    <div>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></meta>
        <title>Whatsapp Web</title>
      </Head>
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </div>
  );
}

export interface FetchCurrentUserAction {
  type: ActionTypes.fetchCurrentUser;
  payload: User | null;
}

// MyApp.getInitialProps = async (appContext: AppContext) => {
//   try {
//     const res = await axios.get("/api/currentUser", {
//       headers: appContext.ctx.req?.headers
//     });
//     let appProps = {};
//     if (App.getInitialProps) {
//       appProps = await App.getInitialProps({
//         ...appContext,
//         ctx: { ...appContext.ctx, ...res.data }
//       });
//     }
//     appContext.ctx.store.dispatch<FetchCurrentUserAction>({
//       type: ActionTypes.fetchCurrentUser,
//       payload: res.data.currentUser
//     });
//     return { ...appProps, user: res.data.currentUser };
//   } catch (error) {
//     console.log(error.response);
//   }
// };

export default MyApp;
