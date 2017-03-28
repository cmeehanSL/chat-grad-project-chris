import React from "react";
import {connect} from "react-redux";
import * as chatActionCreators from "../actions/chatActions";
import {bindActionCreators} from "redux";

import UserComponent from "./UserComponent.jsx";
import FriendListComponent from "./FriendListComponent.jsx";
import ConversationComponent from "./ConversationComponent.jsx";
import SendComponent from "./SendComponent.jsx";

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
        const { activeUser, associativeFriendList, currentConversation, actions } = this.props;
        var inConversation = (this.props.currentConversation.participants !== null);
        return (
            <div id="mainWindow">
                <div id="contactBar">
                    <UserComponent closeConversation={actions.closeConversation} user={activeUser} />
                    <FriendListComponent actions={actions} friendList={associativeFriendList} />
                </div>
                <div id="chatWindow">
                    &nbsp;
                    <div>
                        {inConversation ? <ConversationComponent activeUser={activeUser}
                            currentConversation={currentConversation}/> : null}
                    </div>

                    <div id="sendArea">
                        {inConversation ? <SendComponent currentConversation={currentConversation}
                            sendMessage={actions.sendMessage}
                            createNewConversation={actions.createNewConversation}/> : null}
                    </div>
                </div>
            </div>
        );
    }
}
