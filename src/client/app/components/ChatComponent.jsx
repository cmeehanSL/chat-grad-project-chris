import React from "react";
import {connect} from "react-redux";


export default class ChatComponent extends React.Component {

    constructor(props) {
        super(props);
        this.handleMakeActiveChat = this.handleMakeActiveChat.bind(this);
    }

    handleMakeActiveChat() {
        var activeUser = this.props.activeUser;
        var conversation = this.props.conversation;
        var actions = this.props.actions;
        var friendList = this.props.friendList;
        var openConversation = actions.openConversation;
        var fetchConversation = actions.fetchConversation;
        var loadParticipantInfo = actions.loadParticipantInfo;
        var otherParticipantIds = conversation.participants.filter(function(participantId) {
            return (participantId != activeUser._id);
        });
        loadParticipantInfo(otherParticipantIds, friendList);

        // if (friend.chatId !== null) {
            fetchConversation(conversation.chatId);
        // }
    }

    render() {
        var activeUser = this.props.activeUser;
        var participantIds = this.props.conversation.participants;
        return (
            <div onClick={this.handleMakeActiveChat} className="well">
                <span className="conversationTab">
                    {participantIds.map(function(id, key) {
                        return (
                            <span key={key}>
                                {(id !== activeUser._id) ? <h5>{id}&nbsp;</h5> : null}
                            </span>
                        )
                    })}
                </span>
            </div>
        );
    }
}
