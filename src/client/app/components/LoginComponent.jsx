import React from "react";
import {connect} from "react-redux";
import { loginAttempt } from "../actions/loginActions";
import Layout from "./Layout.jsx";

@connect((store) => {

    return {
        loggedIn: store.loginReducer.loggedIn,
        attemptingLogin: store.loginReducer.attemptingLogin,
        loginUri: store.loginReducer.loginUri
    };
})
export default class LoginComponent extends React.Component {

    componentWillMount() {
        this.props.dispatch(loginAttempt());
    }

    render() {
        if(this.props.loggedIn == false) {
            return (
                <button class="btn btn-primary"><a href={this.props.loginUri}>Log In</a></button>
            );
        }
        else {
            return(
                <Layout />
            )
        }
    }
}
