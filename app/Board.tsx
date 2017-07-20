import * as React from "react";

import {Button, Modal} from "react-bootstrap";
import * as autosize from "autosize";

import {Card, Column, User} from "./Types";
import ColumnComponent from "./ColumnComponent";
import Auth from "./Auth";
import * as firebase from "firebase";
import DataSnapshot = firebase.database.DataSnapshot;
import Reference = firebase.database.Reference;

interface AppState {
  columns: Array<Column>;
  newColModalOpen: boolean;
  newColName: string;
  user: User;
  userMap: Map<string, User>
}

interface BoardProps {
  boardId: string;
}

declare let process: any;

class Board extends React.Component<BoardProps, AppState> {

  columnsRef: Reference;
  boardRef: Reference;
  auth: Auth;

  constructor() {
    super();

    this.state = {
      columns: [],
      newColModalOpen: false,
      newColName: "",
      user: null,
      userMap: new Map<string, User>()
    };

    this.openModalNewCol = this.openModalNewCol.bind(this);
    this.closeModalNewCol = this.closeModalNewCol.bind(this);
    this.onChangeNewColName = this.onChangeNewColName.bind(this);
    this.addCol = this.addCol.bind(this);
    this.deleteCard = this.deleteCard.bind(this);
    this.setEditCard = this.setEditCard.bind(this);
    this.saveCard = this.saveCard.bind(this);
    this.setUser = this.setUser.bind(this);
    this.getBoardInfo = this.getBoardInfo.bind(this);
  }

  componentDidMount() {
    this.initFirebase();
  }

  componentDidUpdate() {
    let c: any = jQuery("textarea");
    autosize(c);
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

    this.boardRef = firebase.database().ref("boards/" + this.props.boardId);

    this.auth = new Auth(this.boardRef, this.setUser);
    this.auth.signIn();

    this.columnsRef = this.boardRef.child("/columns");

  }

  setUser(user: User) {
    this.setState({user: user});
    this.getBoardInfo();
  }

  getBoardInfo() {
    this.boardRef.on("value", (boardSnapshot: DataSnapshot) => {
      let columns: Array<Column> = [];
      boardSnapshot.child("columns").forEach((columnSnapshot: DataSnapshot) => {
        let col: Column = new Column(columnSnapshot.key, columnSnapshot.val().title);

        columnSnapshot.child("cards").forEach((cardSnapshot: DataSnapshot) => {

          let card: Card = new Card(cardSnapshot.key,
              cardSnapshot.val().text,
              cardSnapshot.val().userId,
              cardSnapshot.val().isEditing,
              cardSnapshot.val().isHidden);
          col.addCard(card);
          return false;
        });

        columns.push(col);
        return false;
      });

      let users: Array<User> = [];
      boardSnapshot.child("users").forEach((usersSnapshot: DataSnapshot) => {
        let user: User = new User(usersSnapshot.val().userId, usersSnapshot.val().userNumber);
        users.push(user);
        return false;
      });
      let userMap: Map<string, User> = new Map<string, User>();
      users.forEach((user: User) => userMap.set(user.userId, user));

      this.setState({columns: columns, userMap: userMap});

    });
  }

  addCard(colId: string) {
    return () => {
      let newCardRef = this.columnsRef.child(colId).child("cards").push();
      newCardRef.set({text: "", isEditing: true, userId: this.state.user.userId});
    };
  }

  deleteCard(colId: string, cardId: string): () => void {
    return () => {
      this.columnsRef.child(colId).child("cards").child(cardId).remove();
    };
  }

  setEditCard(colId: string, cardId: string): () => void {
    return () => {
      this.columnsRef.child(colId).child("cards").child(cardId).update({isEditing: true});
    };
  }

  saveCard(colId: string, cardId: string): (text: string) => void {
    return (text: string) => {
      this.columnsRef.child(colId).child("cards").child(cardId).update({isEditing: false, text: text});
    };
  }

  openModalNewCol() {
    this.setState({newColModalOpen: true, newColName: ""});
  }

  closeModalNewCol() {
    this.setState({newColModalOpen: false});
  }

  onChangeNewColName(event: any) {
    this.setState({newColName: event.target.value});
  }

  addCol() {
    let newColRef = this.columnsRef.push();
    newColRef.set({title: this.state.newColName});
    this.setState({newColModalOpen: false});
  }

  renderCols() {

    return this.state.columns.map((col: Column, index: number) => {
      return <ColumnComponent key={index} column={col} colNb={this.state.columns.length}
                              addCard={this.addCard(col.id)} deleteCard={this.deleteCard}
                              setEditCard={this.setEditCard}
                              saveCard={this.saveCard}
                              user={this.state.user}
                              userMap={this.state.userMap}
      />;
    });
  }

  render() {
    return <div>

      Hello Retro
      <br/>
      <Button bsSize="xs" bsStyle="primary" onClick={this.openModalNewCol}>
        Add column
      </Button>

      <br/>
      <br/>

      <div className="row">

        {this.renderCols()}

      </div>

      <Modal show={this.state.newColModalOpen} onHide={this.closeModalNewCol} bsSize="large">
        <Modal.Header closeButton>
          <Modal.Title>New column name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type="text" onChange={this.onChangeNewColName} value={this.state.newColName}/>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.closeModalNewCol}>Cancel</Button>
          <Button bsStyle="primary" onClick={this.addCol}>Save</Button>
        </Modal.Footer>
      </Modal>

    </div>;
  }

}

export default Board;