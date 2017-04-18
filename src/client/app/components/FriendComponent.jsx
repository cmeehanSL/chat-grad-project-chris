import React from "react";
import {connect} from "react-redux";
import {find} from "underscore";


export default class FriendComponent extends React.Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.selectForGroup = this.selectForGroup.bind(this);
        this.selectedForGroup = this.selectedForGroup.bind(this);
        this.makeActiveChat = this.makeActiveChat.bind(this);
        this.state = {
            selected: this.selectedForGroup()
        }
    }

    componentWillUpdate() {
        if (!this.props.creatingGroup && this.state.selected) {
            this.setState({selected: false});
        }
    }

    selectForGroup() {
        if (!this.state.selected) {
            this.props.groupActions.selectNewMember(this.props.friend);
            this.setState({selected: true});
        }
        else {
            this.props.groupActions.removeNewMember(this.props.friend);
            this.setState({selected: false});
        }
    }

    makeActiveChat() {
        var friend = this.props.friend;
        var actions = this.props.actions;
        var openConversation = actions.openConversation;
        var fetchConversation = actions.fetchConversation;
        openConversation([friend], friend.chatId);

        if (friend.chatId !== null) {
            fetchConversation(friend.chatId);
        }
    }

    handleClick() {
        if (this.props.creatingGroup) {
            this.selectForGroup();
            return;
        }
        this.makeActiveChat();
    }

    selectedForGroup() {
        if (!this.props.creatingGroup) {
            return false;
        }
        var newGroupMembers = this.props.newGroupMembers;
        var member = find(newGroupMembers, function(memberId) {
            return memberId === this.props.friend.id;
        });
        if (member) {
            return true;
        }

        return false;
    }

    render() {
        var friend = this.props.friend;
        var creatingGroup = this.props.creatingGroup;

        return (
            <div onClick={this.handleClick} className="well">
                <span className="friendTab"><img className="avatarImg"
                    src={friend.avatarUrl} /><h5>{friend.id}</h5>
                {(creatingGroup && this.state.selected) ?
                    <span className="selectedMarker glyphicon glyphicon-ok-circle"></span> : null}
                </span>
            </div>
        );
    }
}
