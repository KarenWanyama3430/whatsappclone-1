import React from "react";
import { WrappedFieldProps } from "redux-form";

interface Props extends WrappedFieldProps {
  label: string;
  placeholder: string;
  name: string;
  type: string;
}

const Input: React.FC<Props> = ({
  label,
  placeholder,
  name,
  input,
  meta,
  type
}) => {
  return (
    <div className="form_group">
      {meta.touched && meta.error && <div className="error">{meta.error}</div>}
      <input
        type={type}
        className="input"
        placeholder={placeholder}
        {...input}
        id={name}
      />
      <label className="form_label" htmlFor={name}>
        {label}
      </label>
    </div>
  );
};

export default Input;
