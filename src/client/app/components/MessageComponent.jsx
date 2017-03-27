import React from "react";
import {connect} from "react-redux";


export default class ConversationComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        var message = this.props.message;
        var activeUser = this.props.activeUser;
        var sent = (message.sender == activeUser._id) ? true : false;

        return (
            <div className={sent ? 'sent' : 'received'}>
                <p>{this.props.message.content}</p>
            </div>
        );
    }
}
