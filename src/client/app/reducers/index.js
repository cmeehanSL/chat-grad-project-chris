import { combineReducers } from "redux"

import loginReducer from "./loginReducer";
import chatReducer from "./chatReducer";
import userReducer from "./userReducer";

export default combineReducers({
    chatReducer,
    loginReducer,
    userReducer
})
