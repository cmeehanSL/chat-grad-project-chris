import React from "react";
import {connect} from "react-redux";


@connect((store) => {
    return {
        activeUser: store.userReducer.activeUser;
    };
})
export default class Layout extends React.Component {
    componentWillMount() {
        // TODO calculate the list of the most recent chats etc
    }

    const {activeUser} = this.props;

    render() {
        <UserComponent username={activeUser._id} avatar={activeUser.avatarUrl} />
    }
}
