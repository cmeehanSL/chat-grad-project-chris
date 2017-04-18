import React from "react";
export default class LoginComponent extends React.Component {

    render() {
        return (
            <a className="btn btn-primary" href={this.props.loginUri}>Log In</a>
        );
    }
}
