import React from 'react'

class UserComponent extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <span><h3>{this.props.name}</h3><img src={this.props.profilePic}></img></span>
        )
    }
}
export default UserComponent;
