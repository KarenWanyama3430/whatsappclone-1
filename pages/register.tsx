import React, { useState } from "react";
import { Field, InjectedFormProps, reduxForm } from "redux-form";
import Input from "../components/Input";
import validator from "validator";
import { axios } from "../Axios";
import Router from "next/router";
import { withAuth } from "../HOCs/withAuth";
import { GetServerSideProps } from "next";
import { initializeStore } from "../redux";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const register: React.FC<InjectedFormProps<FormValues>> = props => {
  const [loading, setLoading] = useState<boolean>(false);
  const [request, setRequest] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const registerUser = async (formValues: FormValues): Promise<void> => {
    try {
      setError(null);
      setLoading(true);
      await axios.post("/api/register", formValues);
      setLoading(false);
      Router.push("/login");
      setRequest(true);
    } catch (error) {
      console.log(error.response);
      setError("Email is already in use");
      setRequest(false);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="parent_form">
        <form
          className="form"
          onSubmit={props.handleSubmit((formvalues: FormValues) => {
            registerUser(formvalues);
          })}
        >
          <h1>Register</h1>
          {error && (
            <h3 className="error" style={{ fontSize: "2rem" }}>
              {error}
            </h3>
          )}
          <br />
          <Field
            type="text"
            component={Input}
            placeholder="First Name"
            label="First Name"
            name="firstName"
          />
          <Field
            type="text"
            component={Input}
            placeholder="Last Name"
            label="Last Name"
            name="lastName"
          />
          <Field type="text" component={Input} placeholder="Email" label="Email" name="email" />
          <Field
            type="password"
            component={Input}
            placeholder="Password"
            label="Password"
            name="password"
          />
          <Field
            type="password"
            component={Input}
            placeholder="Confirm Password"
            label="Confirm Password"
            name="confirmPassword"
          />

          <button className="btn" disabled={props.invalid || request || loading}>
            Register
          </button>
          <p>
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

const validate = (formValues: FormValues) => {
  const errors = {} as FormValues;
  if (!formValues.firstName || (formValues.firstName && !formValues.firstName.trim())) {
    errors.firstName = "Please enter a first name";
  }
  if (!formValues.lastName || (formValues.lastName && !formValues.lastName.trim())) {
    errors.lastName = "Please enter a last name";
  }
  if (!formValues.email || (formValues.email && !validator.isEmail(formValues.email))) {
    errors.email = "Please enter a valid email";
  }
  if (!formValues.password || (formValues.password && formValues.password.trim().length < 6)) {
    errors.password = "Password must be six characters min";
  }
  if (
    !formValues.confirmPassword ||
    (formValues.confirmPassword && formValues.confirmPassword !== formValues.password)
  ) {
    errors.confirmPassword = "Passwords do not match";
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
    return {
      props: {
        initialReduxState: store.getState()
      }
    };
  } catch (error) {
    return { props: {} };
    console.log(error);
  }
};

export default reduxForm<FormValues>({ form: "register", validate })(register);
