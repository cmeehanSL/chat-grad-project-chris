import React from "react"

class UserComponent extends React.Component {

    constructor(props) {
        super(props);
        this.handleCloseConveration = this.handleCloseConveration.bind(this);
    }

    handleCloseConveration() {
        this.props.closeConversation();
    }

    render() {
        var user = this.props.user;
        return (
            <div id="userArea" className="well" onClick={this.props.handleCloseConveration}>
                <span className="userTab"><h4>{user._id}</h4><img className="avatarImg"
                    src={user.avatarUrl}></img>
                </span>
            </div>
        )
    }
}

export default UserComponent;
