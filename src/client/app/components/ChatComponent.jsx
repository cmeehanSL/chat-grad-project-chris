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
            return (participantId !== activeUser._id);
        });

        loadParticipantInfo(otherParticipantIds, friendList);
        fetchConversation(conversation.chatId);
    }

    render() {
        var activeUser = this.props.activeUser;
        var conversation = this.props.conversation;
        var mostRecentMessage = conversation.mostRecentMessage;
        var unseenCount = conversation.unseenCount;
        var friendList = this.props.friendList;
        var timestamp;
        var timeString;
        if (mostRecentMessage) {
            timestamp = new Date(mostRecentMessage.timestamp);
            timeString = (
                ("0" + timestamp.getHours()).slice(-2)   + ":" +
                ("0" + timestamp.getMinutes()).slice(-2)
            );
        }
        var participantIds = conversation.participants;
        var otherParticipantIds = participantIds.filter(function(participantId) {
            return (participantId !== activeUser._id);
        });
        var otherParticipant = friendList[otherParticipantIds[0]]
        var groupConvo = (participantIds.length > 2);
        return (
            <div onClick={this.handleMakeActiveChat} className="well">
                <span className="conversationTab">
                    <img className="avatarImg"
                        src={groupConvo ? "./images/group.png" : otherParticipant.avatarUrl} />
                    {otherParticipantIds.map(function(id, key) {
                        return (
                            <span key={key}>
                                <h5>{id}&nbsp;</h5>
                            </span>
                        )
                    })}
                    {unseenCount > 0 ? <span className="badge">{unseenCount}</span> : null}
                    {mostRecentMessage ?
                        <p className="mostRecentMessage">{timeString} &nbsp;
                            {(mostRecentMessage.sender === activeUser._id) ?
                                <span className="glyphicon glyphicon-ok">&nbsp;</span> :
                                    null}
                                    {mostRecentMessage.content}
                        </p> : null
                    }
                </span>
            </div>
        );
    }
}
