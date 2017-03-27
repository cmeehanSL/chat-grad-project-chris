import React from "react";
import {connect} from "react-redux";
import * as chatActionCreators from "../actions/chatActions";
import {bindActionCreators} from "redux";

import UserComponent from "./UserComponent.jsx";
import FriendListComponent from "./FriendListComponent.jsx";
import ConversationComponent from "./ConversationComponent.jsx";
import NewMessageComponent from "./NewMessageComponent.jsx";

function mapStateToProps(state) {
    return {
        activeUser: state.userReducer.activeUser,
        associativeFriendList: state.contactReducer.associativeFriendList,
        currentConversation: state.chatReducer.currentConversation
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(chatActionCreators, dispatch)
    };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class HomeComponent extends React.Component {
    render() {
        console.log("currentConversation in HomeComponent is " + this.props.currentConversation);
        console.log("friends list in HomeComponent is " + this.props.friendList);
        const { activeUser, associativeFriendList, currentConversation, actions } = this.props;
        var inConversation = (this.props.currentConversation.participants !== null);
        console.log("in conversation is "+ inConversation);
        return (
            <div id="mainWindow">
                <div id="contactBar">
                    <UserComponent closeConversation={actions.closeConversation} user={activeUser} />
                    <FriendListComponent actions={actions} friendList={associativeFriendList} />
                </div>
                <div id="chatWindow">
                    &nbsp;
                    <div>
                        {inConversation ? <ConversationComponent activeUser={activeUser} currentConversation={currentConversation}/> : null}
                    </div>

                    <div id="sendArea">
                        {inConversation ? <NewMessageComponent currentConversation={currentConversation} sendMessage={actions.sendMessage} createNewConversation={actions.createNewConversation}/> : null}
                    </div>
                </div>
            </div>
        );
    }
}


// <FriendList />
