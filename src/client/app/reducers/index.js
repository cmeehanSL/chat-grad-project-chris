import { combineReducers } from "redux"

import loginReducer from "./loginReducer";
import contactReducer from "./contactReducer";
import chatReducer from "./chatReducer";
import userReducer from "./userReducer";
import groupReducer from "./groupReducer";

export default combineReducers({
    contactReducer,
    chatReducer,
    loginReducer,
    userReducer,
    groupReducer
})
