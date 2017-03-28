import React from "react";
import {connect} from "react-redux";


export default class HomeComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        var friends = this.props.friends;
        var friend = friends[0];
        console.log("current friends are " + friends);

        return (
            <div className="well chatHeader">
                <span className="friendHeaderTab">
                    <img className="avatarImg" src={friend.avatarUrl} />
                    <h3>{friend.id}</h3>
                </span>
            </div>
        );
    }
}
