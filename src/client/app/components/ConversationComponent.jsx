import React from "react";
import {connect} from "react-redux";
import ReactDOM from "react-dom";

import FriendHeadComponent from "./FriendHeadComponent.jsx";
import MessageComponent from "./MessageComponent.jsx";


export default class ConversationComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.scrollToBottom();
        // this.props.resetUnseenCount(this.props.currentConversation.chatId);
    }

    componentDidUpdate() {
        this.scrollToBottom();
        console.log("current convo is " + this.props.currentConversation.chatId);
        // this.props.resetUnseenCount(this.props.currentConversation.chatId);
    }

    scrollToBottom = () => {
        const node = ReactDOM.findDOMNode(this.refs["messagesEnd"]);
        node.scrollIntoView({behavior: "smooth"});
    }

    render() {
        var currentConversation = this.props.currentConversation;
        var activeUser = this.props.activeUser;
        var friends = currentConversation.participants;
        var messages = currentConversation.messages;

        return (
            <div id="messageArea">
                <FriendHeadComponent friends={currentConversation.participants}/>
                <div ref="messageHistory" id="messageHistory">
                    {messages.map(function(message, key) {
                        return (
                            <div key={key}>
                                <MessageComponent message={message} activeUser={activeUser} key={key}/>
                            </div>
                        )
                    })}
                    <div style={{float: "left", clear: "both"}}
                        ref="messagesEnd">
                    </div>
                </div>
            </div>
        );
    }
}
