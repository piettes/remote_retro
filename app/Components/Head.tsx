import * as React from "react";
import EditableTitle from "./EditableTitle";
import {Card, Column, User} from "../Utils/Types";
import * as firebase from "firebase/app";
import Reference = firebase.database.Reference;
import Auth from "../Utils/Auth";
import DataSnapshot = firebase.database.DataSnapshot;
import {Link} from "react-router-dom";
import {RouteComponentProps, withRouter} from "react-router";

interface HeadProps extends RouteComponentProps<any> {
  setUsers: (user: User, userMap: Map<string, User>) => void;
  setColumns: (columns: Array<Column>) => void;
}

interface HeadState {
  boardTitle: string;
  user: User;
  userMap: Map<string, User>;
  columns: Array<Column>;
}

class Head extends React.Component<HeadProps, HeadState> {

  boardRef: Reference;
  auth: Auth;
  userAuthId: string;

  constructor(props: HeadProps) {
    super(props);

    this.state = {
      boardTitle: "",
      columns: [],
      userMap: new Map<string, User>(),
      user: null
    };
    this.setUserAuthId = this.setUserAuthId.bind(this);
    this.boardRef = firebase.database().ref("boards/" + this.props.match.params.id);
  }

  componentDidMount() {

    // TODO use promise
    this.auth = new Auth(this.boardRef, this.setUserAuthId);
    this.auth.signIn();
    this.getBoardTitle();
  }

  setUserAuthId(authId: string) {
    this.userAuthId = authId;
    this.getBoardInfo();
  }

  getBoardInfo() {
    this.boardRef.child("users").on("value", (usersSnapshot: DataSnapshot) => {
      let users: Array<User> = [];
      let currentUser: User = null;
      usersSnapshot.forEach((usersSnapshot: DataSnapshot) => {
        let user: User = User.fromSnapshot(usersSnapshot);
        users.push(user);

        if (this.userAuthId === usersSnapshot.val().authId) {
          currentUser = user;
        }
        return false;
      });
      let userMap: Map<string, User> = new Map<string, User>();
      users.forEach((user: User) => userMap.set(user.key, user));

      this.setState({user: currentUser, userMap: userMap});
      this.props.setUsers(currentUser, userMap);
    });

    this.boardRef.on("value", (boardSnapshot: DataSnapshot) => {

      let columns: Array<Column> = [];
      boardSnapshot.child("columns").forEach((columnSnapshot: DataSnapshot) => {
        let col: Column = new Column(columnSnapshot.key, columnSnapshot.val().title);

        columnSnapshot.child("cards").forEach((cardSnapshot: DataSnapshot) => {

          let card: Card = Card.fromSnapshot(cardSnapshot);
          col.addCard(card);
          return false;
        });

        columns.push(col);
        return false;
      });

      this.props.setColumns(columns);

    });
  }

  getBoardTitle() {
    this.boardRef.child("title").on("value", (titleSnapshot: DataSnapshot) => {
      this.setState({boardTitle: titleSnapshot.val()});
    });
  }

  updateTitle(title: string) {
    this.boardRef.update({title: title});
  }

  updateUserName(name: string) {
    this.boardRef.child("users").child(this.state.user.key).update({name: name});
  }

  otherUserListDisplay() {
    return Array.from(this.state.userMap.values())
    .filter((user: User) => this.state.user.authId !== user.authId)
    .map((user: User) => {
      return <li key={user.key}
                 className={"card-color-" + user.userNumber}>{user.name === "" ? "Anonymous" : user.name}</li>
    });
  }

  getLinks() {
    if (this.props.location.pathname.endsWith("graph")) {
      return <Link to={"/retro/" + this.props.match.params.id + "/board"}>Board
      </Link>
    } else {
      return <Link to={"/retro/" + this.props.match.params.id + "/graph"}>Graph
      </Link>
    }
  }

  render() {
    if (!this.state.user) {
      return <div/>;
    }

    return <div className="head">

      <div className="row">

        <div className="col-lg-5">
          <EditableTitle title={this.state.boardTitle} updateTitle={(title: string) => this.updateTitle(title)}
                         size="large"/>

          <br/>
          <div>
            {this.getLinks()}
          </div>
        </div>


        <div className="col-lg-4">

          <div className="progress progress-striped active">
            <div className="progress-bar"/>
          </div>

        </div>

        <div className="col-lg-3 user-list">
          <ul>
            <li className={"card-color-" + this.state.user.userNumber}>
              <EditableTitle title={this.state.user.name} updateTitle={(title: string) => this.updateUserName(title)}
                             size="medium" placeHolder={"Enter you name here"}/>
            </li>
            {this.otherUserListDisplay()}
          </ul>
        </div>

      </div>


    </div>
  }
}

export default withRouter<any>(Head);