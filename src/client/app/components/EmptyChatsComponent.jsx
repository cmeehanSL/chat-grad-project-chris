import React from "react";
import {connect} from "react-redux";

export default class ChatComponent extends React.Component {

    // constructor(props) {
    //     super(props);
    //     this.handleMakeActiveChat = this.handleMakeActiveChat.bind(this);
    // }


    render() {
        return (
            <div className="well">
                <span className="emptyChatsTab">
                    <h5>You do not have any active chats &nbsp;
                        <span className="glyphicon glyphicon-thumbs-down"></span>
                    </h5>
                </span>
            </div>
        );
    }
}
