import React from "react";
import {connect} from "react-redux";


export default class HomeComponent extends React.Component {

    constructor(props) {
        super(props);
        this.sendNewMessage = this.sendNewMessage.bind(this);
    }

    sendNewMessage(event) {

        event.preventDefault();
        console.log("hi you've tried to send a message");
        // var currentConversation = this.props.currentConversation;
        // var participants = currentConversation.participants;
        if (this.props.currentConversation.chatId !== null) {
            sendMessage("test message");
        }
        else {
            this.props.createNewConversation();
            this.props.sendMessage("test message");
        }
    }

    render() {
        // var friend = this.props.friend;
        // var openConversation = this.props.openConversation;

        return (
            <form onSubmit={this.sendNewMessage} class="well" id="messageForm">
                <div class="input-group">
                    <input type="text" class="form-control" placeholder="New Message"></input>
                    <span class="input-group-btn">
                      <button class="btn btn-default" id="sendButton" type="submit">Send</button>
                    </span>
                </div>
            </form>
        );
    }
}
