import React from "react";
import {connect} from "react-redux";


export default class FriendHeadComponent extends React.Component {


    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.state = {
            newGroupName: this.props.currentConversation.groupName || "Group",
            editingGroupName: false
        }
    }

    componentDidUpdate() {
        var friends = this.props.friends;
        var groupConvo = (friends.length > 1);
        var newGroupName = this.state.newGroupName;
        var groupName = this.props.currentConversation.groupName;

        if (!this.state.editingGroupName) {
            // if (groupName === null && newGroupName !== "Group" && groupConvo) {
            //     this.setState({newGroupName: "Group"});
            // }
            if (groupName !== null && (groupName !== newGroupName)) {
                this.setState({newGroupName: groupName});
            }
        }

    }


    handleClick() {
        this.setState({editingGroupName: true});
        document.getElementById("groupTitle").disabled = false;
        // this.refs["title"].focus();
        document.getElementById("groupTitle").focus();
    }

    handleChange(event) {
        this.setState({newGroupName: event.target.value});
    }

    handleSubmit(event) {
        event.preventDefault();
        this.setState({editingGroupName: true});
        console.log("submitted name change");
        if (this.state.newGroupName !== null && this.state.newGroupName !== "") {
            var chatId = this.props.currentConversation.chatId;
            var newGroupName = this.state.newGroupName;
            this.props.groupActions.changeGroupName(chatId, newGroupName);
            document.getElementById("groupTitle").blur();
        }
        else {
            document.getElementById("groupTitle").blur();
        }
    }

    handleBlur(event) {
        event.target.value = this.props.currentConversation.groupName;
        this.setState({
            newGroupName: this.props.currentConversation.groupName || null,
            editingGroupName: false
        });
    }

    render() {
        var friends = this.props.friends;
        var groupConvo = (friends.length > 1);
        var friend = friends[0];
        var currentConversation = this.props.currentConversation;
        var groupName = currentConversation.groupName;
        if (!groupName) {
            groupName = "Group";
        }
        var newGroupName = this.state.newGroupName;
        var editing = this.state.editingGroupName;
        console.log("current friends are " + friends);

        // <button onClick={this.handleClick} class="editGroup btn btn-lg btn-primary">
            // <span class="glyphicon glyphicon-edit"></span>
        // </button>

        return (
            <div className="well chatHeader">

                {groupConvo ?
                    <span className="friendHeaderTab">
                        <img className="avatarImg" src={"./images/group.png"} />
                        <form onSubmit={this.handleSubmit} className="editGroupForm">
                            <div className="input-group">
                                <input id="groupTitle" type="text" ref={"title"}
                                    disabled={this.state.editingGroupName ? "" : "disabled"}
                                    className="form-control" onBlur={this.handleBlur} onChange={this.handleChange}
                                    value={editing ? newGroupName : groupName}></input>
                            </div>
                        </form>
                        <button onClick={this.handleClick} className="btn btn-primary">
                            <span className="glyphicon glyphicon-edit"></span>Edit Group Title
                        </button>
                        <ul>
                            {friends.map(function(currentFriend, key) {
                                return (
                                    <li key={key}>
                                        {currentFriend.id}
                                    </li>
                                )
                            })}
                        </ul>
                    </span> :
                    <span className="friendHeaderTab">
                        <img className="avatarImg" src={friend.avatarUrl} />
                        <h3>{friend.id}</h3>
                    </span>
                }
            </div>
        );
    }
}
