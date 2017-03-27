import React from 'react'

class UserComponent extends React.Component {

    constructor(props) {
        super(props);
    }


    render() {
        var user = this.props.user;
        return(
            <div id="userArea" class="well" onClick={this.props.closeConversation}>
                <span class="userTab"><h4>{user._id}</h4><img class="avatarImg" src={user.avatarUrl}></img></span>
            </div>
        )
    }
}
export default UserComponent;
