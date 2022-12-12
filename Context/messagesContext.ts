import React from "react";
import { Message } from "../interfaces/Message";

export const MessagesContext = React.createContext<Message[] | [] | null>(null);
