import React, { useState } from "react";
import Link from "next/link";
import styles from "../styles/login.module.css";
import { Field, InjectedFormProps, reduxForm } from "redux-form";
import Input from "../components/Input";
import validator from "validator";
import { axios } from "../Axios";
import Router from "next/router";
import { fetchCurrentUser } from "../redux/actions";
import { connect, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { FetchCurrentUserAction } from "./_app";
import { ActionTypes } from "../redux/actions/types";
import { withAuth } from "../HOCs/withAuth";
import { GetServerSideProps } from "next";
import { initializeStore } from "../redux";

interface FormValues {
  email: string;
  password: string;
}

interface Props {
  fetchCurrentUser: () => void;
}

const login: React.FC<Props & InjectedFormProps<FormValues>> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const [request, setRequest] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const loginUser = async (formValues: FormValues): Promise<void> => {
    try {
      setError("");
      setLoading(true);
      const res = await axios.post("/api/login", formValues);
      dispatch<FetchCurrentUserAction>({
        type: ActionTypes.fetchCurrentUser,
        payload: res.data
      });
      setLoading(false);
      setRequest(true);
      Router.replace("/");
    } catch (error) {
      setError("Invalid email or password");
      setLoading(false);
      setRequest(false);
    }
  };
  return (
    <div className="container">
      <div className="parent_form login">
        <form
          className="form"
          onSubmit={props.handleSubmit((formValues: FormValues) => {
            loginUser(formValues);
          })}
        >
          <h1 className="login_h1">Login</h1>

          {error && (
            <h3 className="error" style={{ fontSize: "2rem" }}>
              {error}
            </h3>
          )}
          <br />
          <Field type="text" component={Input} placeholder="Email" label="Email" name="email" />
          <Field
            type="password"
            component={Input}
            placeholder="Password"
            label="Password"
            name="password"
          />
          <button className="btn" disabled={props.invalid || loading || request}>
            Login
          </button>
          <p>
            Don't have an account? <a href="/register">Register</a>
          </p>
        </form>
      </div>
    </div>
  );
};

const validate = (formValues: FormValues) => {
  const errors = {} as FormValues;
  if (!formValues.password || (formValues.password && formValues.password.trim().length < 6)) {
    errors.password = "Password must be six characters min";
  }
  if (!formValues.email || (formValues.email && !validator.isEmail(formValues.email))) {
    errors.email = "Please enter a valid email";
  }
  return errors;
};

export const getServerSideProps: GetServerSideProps = async ctx => {
  try {
    const store = initializeStore();
    const authenticated = await withAuth(ctx, store);
    if (authenticated) {
      return {
        redirect: {
          destination: "/",
          permanent: true
        }
      };
    }
    return { props: { initialReduxState: store.getState() } };
  } catch (error) {
    console.log(error);
    return { props: {} };
  }
};

export default reduxForm<FormValues>({ form: "login", validate })(
  connect(null, dispatch => bindActionCreators({ fetchCurrentUser }, dispatch))(
    // @ts-ignore
    login
  )
);
