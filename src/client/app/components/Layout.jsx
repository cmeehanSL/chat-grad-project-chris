import React from "react";
import {connect} from "react-redux";
import UserComponent from "./UserComponent.jsx";


@connect((store) => {
    return {
        activeUser: store.userReducer.activeUser
    };
})
export default class Layout extends React.Component {
    // componentWillMount() {
    //     // TODO calculate the list of the most recent chats etc
    // }


    render() {
        const activeUser = this.props.activeUser;
        return(
            <UserComponent username={activeUser._id} avatar={activeUser.avatarUrl} />
        )
    }
}
