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
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    scrollToBottom = () => {
        const node = ReactDOM.findDOMNode(this.messagesEnd);
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
                    <div style={ {float:"left", clear: "both"} }
                        ref={(el) => { this.messagesEnd = el; }}>
                    </div>
                </div>
            </div>
        );
    }
}
