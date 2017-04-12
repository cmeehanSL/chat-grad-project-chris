import React from "react";
import {connect} from "react-redux";


export default class HomeComponent extends React.Component {


    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.state = {
            newGroupName: null,
            editingGroupName: false
        }
    }

    handleClick() {
        this.setState({editingGroupName: true});
        this.refs["title"].focus();
    }

    handleChange(event) {
        this.setState({newGroupName: event.target.value});
    }

    render() {
        var friends = this.props.friends;
        var friend = friends[0];
        var groupConvo = (friends.length > 1);
        var currentConversation = this.props.currentConversation;
        console.log("current friends are " + friends);

        // <button onClick={this.handleClick} class="editGroup btn btn-lg btn-primary"><span class="glyphicon glyphicon-edit"></span></button>

        return (
            <div className="well chatHeader">

                {groupConvo ?
                    <span className="friendHeaderTab">
                        <img className="avatarImg" src={"./images/group.png"} />
                        <form>
                            <div class="input-group">
                                <input type="text" ref={"title"} class="form-control groupTitle" onChange={this.handleChange} value={this.state.newGroupName || "Group Includes:"}></input>
                            </div>

                        </form>
                            <ul>
                                {friends.map(function(currentFriend, key) {
                                    return (
                                        <li key={key}>
                                            {currentFriend.id}
                                        </li>
                                    )
                                })}
                            </ul>
                    </span>
                    :
                    <span className="friendHeaderTab">
                        <img className="avatarImg" src={friend.avatarUrl} />
                        <h3>{friend.id}</h3>
                    </span>
                }
            </div>
        );
    }
}
