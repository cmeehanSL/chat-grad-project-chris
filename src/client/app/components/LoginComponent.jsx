import React from "react";
import {connect} from "react-redux"
import { loginAttempt } from "../actions/loginActions"

@connect((store) => {

    console.log("this is " + store);
    return {
        loggedIn: store.loginReducer.loggedIn,
        attemptingLogin: store.loginReducer.attemptingLogin,
        loginUri: store.loginReducer.loginUri
    };//
})
export default class LoginComponent extends React.Component {

    componentWillMount() {
        this.props.dispatch(loginAttempt());
    }

    render() {
        // if not logged in render the button with the link
        return (
            <button class="btn btn-primary"><a href={this.props.loginUri}>Log In</a></button>
        );
        // if logged in then render the list of the users
    }
}
