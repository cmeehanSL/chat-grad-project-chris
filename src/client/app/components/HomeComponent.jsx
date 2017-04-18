import React from "react";
import {connect} from "react-redux";
import * as chatActionCreators from "../actions/chatActions";
import * as groupActionCreators from "../actions/groupActions";

import {bindActionCreators} from "redux";

import UserComponent from "./UserComponent.jsx";
import ListComponent from "./ListComponent.jsx";
import ConversationComponent from "./ConversationComponent.jsx";
import SendComponent from "./SendComponent.jsx";

function mapStateToProps(state) {
    return {
        activeUser: state.userReducer.activeUser,
        associativeFriendList: state.contactReducer.associativeFriendList,
        currentConversation: state.chatReducer.currentConversation,
        listingContacts: state.contactReducer.listingContacts,
        conversations: state.chatReducer.associativeConversations,
        creatingGroup: state.groupReducer.creatingGroup,
        newGroupMembers: state.groupReducer.newGroupMembers
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(chatActionCreators, dispatch),
        groupActions: bindActionCreators(groupActionCreators, dispatch)
    };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class HomeComponent extends React.Component {

    componentDidMount() {
        this.props.actions.initialiseSocket();

        // this.props.resetUnseenCount(this.props.currentConversation.chatId);
    }

    render() {
        const {
            activeUser, associativeFriendList,
            currentConversation, listingContacts,
            actions, groupActions, conversations, creatingGroup, newGroupMembers
        } = this.props;
        var inConversation = (this.props.currentConversation.participants.length > 0);
        return (
            <div id="mainWindow">
                <div id="contactBar">
                    <UserComponent closeConversation={actions.closeConversation} user={activeUser} />
                    <ListComponent activeUser={activeUser} groupActions={groupActions} actions={actions}
                        friendList={associativeFriendList} newGroupMembers={newGroupMembers}
                        listingContacts={listingContacts} conversations={conversations} creatingGroup={creatingGroup}/>
                </div>
                <div id="chatWindow">
                    {inConversation ? <ConversationComponent resetUnseenCount={actions.resetUnseenCount}
                        activeUser={activeUser} groupActions={groupActions}
                        currentConversation={currentConversation}/> :
                        null
                    }
                    <div id="sendArea">
                        {inConversation ? <SendComponent currentConversation={currentConversation}
                            sendMessage={actions.sendMessage}
                            createNewConversation={actions.createNewConversation}/> :
                            null
                        }
                    </div>
                </div>
            </div>
        );
    }
}
