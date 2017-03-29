import React from "react";
import {connect} from "react-redux";
import ChatComponent from "./ChatComponent.jsx";


export default class ChatListComponent extends React.Component {


    render() {
        var conversations = this.props.conversations;
        var activeUser = this.props.activeUser;
        var friendList = this.props.friendList;
        var actions = this.props.actions;
        // var sortedConversations = conversations.sort(function(a, b) {
        //     var date1 = new Date(a.messages.slice(-1)[0].timestamp);
        //     var date2 = new Date(b.messages.slice(-1)[0].timestamp);
        //     if (date1 > date2) {
        //         return 1;
        //     }
        //     if (date2 > date1) {
        //         return 0;
        //     }
        //     return 0;
        // });

        return (
            <ul id="chatList">
                {conversations.map(function(conversation, key) {
                    return (
                        <li key={key}>
                            <ChatComponent friendList={friendList} actions={actions} activeUser={activeUser} conversation={conversation} key={key}/>
                        </li>
                    )
                })}
            </ul>
        );
    }
}
