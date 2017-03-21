import React from 'react';
import {render} from 'react-dom';
import {Provider} from "react-redux"

import AwesomeComponent from './components/AwesomeComponent.jsx';
import LayoutComponent from './components/LayoutComponent.jsx';
import store from "./store";
// import UserComponent from './UserComponent.jsx';

require('../public/scss/main.scss');

const app = document.getElementById("app");


render(<Provider store={store}>
    <LayoutComponent />
</Provider>, app);
