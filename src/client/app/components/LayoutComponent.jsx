import React from "react";
// Required Methods
import {connect} from "react-redux";
import { bindActionCreators } from "redux";
import { loginAttempt } from "../actions/loginActions";
// Required Components
import LoginComponent from "./LoginComponent.jsx";
import HomeComponent from "./HomeComponent.jsx";

function mapStateToProps(state) {
    return {
        loggedIn: state.loginReducer.loggedIn,
        loginUri: state.loginReducer.loginUri
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loginAttempt: bindActionCreators(loginAttempt, dispatch)
    };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class Layout extends React.Component {

    componentWillMount() {
        this.props.loginAttempt();
        // TODO calculate the list of the most recent chats etc
    }

    render() {
        if(!this.props.loggedIn) {
            return(
                <LoginComponent loginUri={this.props.loginUri} />
            )
        }
        else {
            return(
                <HomeComponent />
            )
        }
    }
}
