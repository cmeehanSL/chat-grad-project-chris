import React from 'react';
import {render} from 'react-dom';
import {Provider} from "react-redux"

import AwesomeComponent from './components/AwesomeComponent.jsx';
import LoginComponent from './components/LoginComponent.jsx';
import store from "./store";
// import UserComponent from './UserComponent.jsx';

require('../public/scss/main.scss');

const app = document.getElementById("app");

class App extends React.Component {
  render () {
    return (
        <div>
            <p>Hello reacts</p>
            <AwesomeComponent />
        </div>
    )
  }
}

render(<Provider store={store}>
    <div>
        <App/>
        <LoginComponent />
    </div>
</Provider>, app);
