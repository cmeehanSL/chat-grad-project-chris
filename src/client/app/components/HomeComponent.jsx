import React from "react";
import {connect} from "react-redux";
import * as chatActionCreators from "../actions/chatActions";
import {bindActionCreators} from "redux";

import UserComponent from "./UserComponent.jsx";
import FriendListComponent from "./FriendListComponent.jsx";
import FriendHeadComponent from "./FriendHeadComponent.jsx";
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
        var inConversation = (this.props.currentConversation.participants !== undefined);
        console.log("in conversation is "+ inConversation);
        return (
            <div id="mainWindow">
                <div id="contactBar">
                    <UserComponent user={activeUser} />
                    <FriendListComponent openConversation={actions.openConversation} friendList={associativeFriendList} />
                </div>
                <div id="chatWindow">
                    <div id="messageHistory">
                        {inConversation ? <FriendHeadComponent friends={currentConversation.participants}/> : null}
                    </div>
                    <div id="sendArea">
                    <NewMessageComponent currentConversation={currentConversation} sendMessage={actions.sendMessage} createNewConversation={actions.createNewConversation}/>
                    </div>
                </div>
            </div>
        );
    }
}


// <FriendList />
