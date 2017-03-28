import React from "react";
import {connect} from "react-redux";


export default class HomeComponent extends React.Component {

    constructor(props) {
        super(props);
        this.handleSendNewMessage = this.handleSendNewMessage.bind(this);
    }

    handleSendNewMessage(event) {
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

        return (
            <form onSubmit={this.handleSendNewMessage} className="well" id="messageForm">
                <div className="input-group">
                    <input ref="messageInput" type="text" className="form-control" placeholder="New Message"></input>
                    <span className="input-group-btn">
                      <button className="btn btn-default" id="sendButton" type="submit">Send
                      </button>
                    </span>
                </div>
            </form>
        );
    }
}
