import React from 'react'

class UserComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <span><h3>{this.props.username}</h3><img src={this.props.avatar}></img></span>
        )
    }
}
export default UserComponent;
