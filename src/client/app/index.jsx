import React from "react";
import {render} from "react-dom";
import {Provider} from "react-redux"

import LayoutComponent from "./components/LayoutComponent.jsx";
import store from "./store";

require("../public/scss/main.scss");

const app = document.getElementById("app");

render (
    <Provider store={store}>
        <LayoutComponent />
    </Provider>,
    app
);
