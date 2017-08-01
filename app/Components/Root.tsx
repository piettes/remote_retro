import * as React from "react";
import {Router, Route, Switch} from "react-router";
import createBrowserHistory from "history/createBrowserHistory";
import * as firebase from "firebase";
import Reference = firebase.database.Reference;
import Board from "./Board";
import WelcomePage from "./WelcomePage";
import Graph from "./Graph";
import Head from "./Head";
import {Column, User} from "../Utils/Types";

declare let process: any;

interface RootState {
  user: User;
  userMap: Map<string, User>;
  columns: Array<Column>;
}

class Root extends React.Component<any, RootState> {

  history: any;

  constructor() {
    super();
    this.initFirebase();

    this.state = {
      user: null,
      columns: [],
      userMap: new Map<string, User>()
    };

    this.history = createBrowserHistory();
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

  setUsers(user: User, userMap: Map<string, User>): void {
    this.setState({user: user, userMap: userMap});
  }

  setColumns(columns: Array<Column>): void {
    this.setState({columns: columns});
  }

  render() {

    return (
        <Router history={this.history}>
          <div>
            <Route exact path="/" component={WelcomePage}/>

            <Route path="/retro/:id" render={(props: any) =>
                <Head setUsers={(user: User, userMap: Map<string, User>) => this.setUsers(user, userMap)}
                      setColumns={(columns: Array<Column>) => this.setColumns(columns)}
                />
            }
            />
            <Switch>
              <Route path="/retro/:id/board" render={(props: any) =>
                  <Board user={this.state.user}
                         userMap={this.state.userMap}
                         columns={this.state.columns}
                  />
              }/>
              <Route path="/retro/:id/graph" render={(props: any) =>
                  <Graph user={this.state.user}
                         userMap={this.state.userMap}/>
              }/>
            </Switch>
          </div>
        </Router>
    );
  }
}

export default Root;