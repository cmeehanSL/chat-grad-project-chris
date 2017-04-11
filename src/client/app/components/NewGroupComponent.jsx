import React from "react";
import {connect} from "react-redux";


export default class NewGroupComponent extends React.Component {

    constructor(props) {
        super(props);
        this.handleStartNewGroup = this.handleStartNewGroup.bind(this);
        this.handleCancelNewGroup = this.handleCancelNewGroup.bind(this);
        this.handleCreateGroup = this.handleCreateGroup.bind(this);

    }

    handleStartNewGroup() {
        if (!this.props.creatingGroup) {
            this.props.groupActions.startGroupCreation();
        }
    }

    handleCancelNewGroup() {
        if (this.props.creatingGroup) {
            this.props.groupActions.cancelGroupCreation();
        }
    }

    handleCreateGroup() {
        if (this.props.creatingGroup && this.props.newGroupMembers > 0) {
            this.props.groupActions.createGroup();
        }
    }

    render() {
        var friend = this.props.friend;
        var creatingGroup = this.props.creatingGroup;
        var newGroupMembers = this.props.newGroupMembers;

        return (
            <div className="well">
                <span className="newGroupTab">
                    {newGroupMembers.length > 0 ? <button onClick={this.handleCreateGroup} className="createGroup btn btn-success">Confirm New Group</button> :
                        <button onClick={this.handleStartNewGroup} className={!creatingGroup ? "createGroup btn btn-primary" : "disabled createGroup btn btn-primary"}>Create New Group</button>
                    }
                    {creatingGroup ? <button onClick={this.handleCancelNewGroup} className={creatingGroup ? "cancelGroup btn btn-danger" : "disabled cancelGroup btn btn-danger"}>Cancel New Group</button> : null}
                </span>
            </div>
        );
    }
}
