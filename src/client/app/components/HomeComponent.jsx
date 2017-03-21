import React from "react";
import {connect} from "react-redux";

import UserComponent from "./UserComponent.jsx";
import FriendListComponent from "./FriendListComponent.jsx";

@connect((store) => {

    return {
        activeUser: store.userReducer.activeUser,
        friendList: store.chatReducer.friendList
    };
})
export default class HomeComponent extends React.Component {


    render() {
        console.log("friends list in HomeComponent is " + this.props.friendList);
        const { activeUser, friendList } = this.props;
        return (
            <div id="mainWindow">
                <div id="contactBar">
                    <UserComponent user={activeUser} />
                    <FriendListComponent friendList={friendList} />
                </div>
                <div id="chatWindow">
                    hi
                    <div id="chatArea">
                        hi
                    </div>
                </div>
            </div>
        );
    }
}


// <FriendList />
