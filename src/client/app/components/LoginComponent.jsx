import React from "react";
export default class LoginComponent extends React.Component {

    render() {
        return (
            <a class="btn btn-primary" href={this.props.loginUri}>Log In</a>
        );
    }
}
