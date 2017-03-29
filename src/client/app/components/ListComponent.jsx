import React from "react";
import {connect} from "react-redux";

import FriendListComponent from "./FriendListComponent.jsx";
import ChatListComponent from "./ChatListComponent.jsx";

export default class ListComponent extends React.Component {

    constructor(props) {
        super(props);
        this.handleDisplayChats = this.handleDisplayChats.bind(this);
        this.handleDisplayContacts = this.handleDisplayContacts.bind(this);
    }


    handleDisplayChats() {
        this.props.actions.changeListingContacts(false);
    }

    handleDisplayContacts() {
        this.props.actions.changeListingContacts(true);
    }

    render() {
        var friendList = this.props.friendList;
        var activeUser = this.props.activeUser;
        var actions = this.props.actions;
        var listingContacts = this.props.listingContacts;
        var conversations = this.props.conversations;
        return (
            <div>
                <ul class="nav nav-tabs" role="tablist">
                    <li role="presentation" className={!listingContacts ? "active" : null}><a onClick={this.handleDisplayChats} href="#">Chats</a></li>
                    <li role="presentation" className={listingContacts ? "active" : null}><a onClick={this.handleDisplayContacts} href="#">Contacts</a></li>
                </ul>
                {listingContacts ? <FriendListComponent actions={actions} friendList={friendList} />
            : <ChatListComponent friendList={friendList} activeUser={activeUser} conversations={conversations} actions={actions} />}
            </div>
        );
    }
}
