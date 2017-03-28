import React from "react";
import {connect} from "react-redux";


export default class ConversationComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        var message = this.props.message;
        var activeUser = this.props.activeUser;
        var sent = (message.sender === activeUser._id) ? true : false;
        var className = sent ? "triangle-isosceles left" : "triangle-isosceles right";
        var timestamp = new Date(message.timestamp);
        var timeString = (
            ("0" + timestamp.getHours()).slice(-2)   + ":" +
            ("0" + timestamp.getMinutes()).slice(-2)
        );

        return (
            <div className={sent ? "sent" : "received"}>
                <p className={className}>
                    {this.props.message.content}
                    <br/>
                    <span className="messageTime">
                            {timeString}
                    </span>
            </p>
            </div>
        );
    }
}
