import React from "react";
import { User } from "../interfaces/User";

interface State {
  user: User | null;
}

export const UserContext = React.createContext<State>({
  user: null
});
