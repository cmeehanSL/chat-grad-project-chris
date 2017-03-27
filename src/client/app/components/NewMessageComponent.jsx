import React from "react";
import {connect} from "react-redux";


export default class HomeComponent extends React.Component {

    constructor(props) {
        super(props);
        this.sendNewMessage = this.sendNewMessage.bind(this);
    }

    sendNewMessage(event) {
        event.preventDefault();
        var message = this.refs["messageInput"].value;
        this.refs["messageInput"].value = "";

        console.log("hi you've tried to send a message");
        var currentConversation = this.props.currentConversation;
        if (currentConversation.chatId !== null) {
            this.props.sendMessage(currentConversation.chatId, message);
        }
        else {
            this.props.createNewConversation(currentConversation.participants, message);
        }
    }

    render() {
        // var friend = this.props.friend;
        // var openConversation = this.props.openConversation;

        return (
            <form onSubmit={this.sendNewMessage} class="well" id="messageForm">
                <div class="input-group">
                    <input ref="messageInput" type="text" class="form-control" placeholder="New Message"></input>
                    <span class="input-group-btn">
                      <button class="btn btn-default" id="sendButton" type="submit">Send</button>
                    </span>
                </div>
            </form>
        );
    }
}
