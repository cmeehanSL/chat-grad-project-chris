import React from "react";
export default class LoginComponent extends React.Component {


    render() {
        return (
            <button class="btn btn-primary"><a href={this.props.loginUri}>Log In</a></button>
        );
    }
}
