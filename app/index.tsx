import * as ReactDOM from "react-dom";
import * as React from "react";

import Root from "./Components/Root";

import "bootstrap/dist/css/bootstrap.css";
import "bootswatch/paper/bootstrap.css";

import * as jQuery from "jquery";

declare global {
  interface Window { jQuery: any;
    $: any;
  }
}

window.jQuery = jQuery || {};

import "bootstrap";

import "../resources/css/custom.css";


ReactDOM.render(<Root />, document.getElementById("app"));
