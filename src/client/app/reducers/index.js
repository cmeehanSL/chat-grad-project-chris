import { combineReducers } from "redux"

import loginReducer from "./loginReducer";
import contactReducer from "./contactReducer";
import chatReducer from "./chatReducer";
import userReducer from "./userReducer";

export default combineReducers({
    contactReducer,
    chatReducer,
    loginReducer,
    userReducer
})
