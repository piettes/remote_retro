import * as React from "react";
import {Router, Route} from "react-router";
import createBrowserHistory from "history/createBrowserHistory";
import * as firebase from "firebase";
import Board from "./Board";
import WelcomePage from "./WelcomePage";

declare let process: any;

class Root extends React.Component<any, any> {

  constructor() {
    super();
    this.initFirebase()
  }

  initFirebase() {
    let config = {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
    };

    firebase.initializeApp(config);
  }

  render() {

    const history = createBrowserHistory();
    return (
        <Router history={history}>
          <div>
            <Route exact path="/" component={WelcomePage}/>
            <Route path="/board/:id" component={Board}/>
          </div>
        </Router>
    );
  }
}

export default Root;