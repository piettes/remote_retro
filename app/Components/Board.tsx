import * as React from "react";
import {Button, Modal} from "react-bootstrap";

import * as firebase from "firebase";
import DataSnapshot = firebase.database.DataSnapshot;
import Reference = firebase.database.Reference;

import * as autosize from "autosize";

import {Card, Column, User} from "../Utils/Types";
import ColumnComponent from "./ColumnComponent";
import Auth from "../Utils/Auth";
import Head from "./Head";

interface BoardState {
  columns: Array<Column>;
  newColModalOpen: boolean;
  removeColumnModalOpen: boolean;
  newColName: string;
  user: User;
  userMap: Map<string, User>;
  boardTitle: string;
  removeColumnTitle: string;
  removeColumnKey: string;
}

interface BoardProps {
  match: any;
}

declare let process: any;

class Board extends React.Component<BoardProps, BoardState> {

  columnsRef: Reference;
  boardRef: Reference;
  auth: Auth;
  userAuthId: string;

  constructor(props: BoardProps) {
    super(props);

    this.state = {
      columns: [],
      newColModalOpen: false,
      removeColumnModalOpen: false,
      newColName: "",
      user: null,
      userMap: new Map<string, User>(),
      boardTitle: "",
      removeColumnTitle: "",
      removeColumnKey: ""
    };

    this.setUserAuthId = this.setUserAuthId.bind(this);
  }

  componentDidMount() {
    this.boardRef = firebase.database().ref("boards/" + this.props.match.params.id);

    // TODO use promise
    this.auth = new Auth(this.boardRef, this.setUserAuthId);
    this.auth.signIn();

    this.columnsRef = this.boardRef.child("columns");
  }

  componentDidUpdate() {
    let c: any = jQuery("textarea");
    autosize(c);
  }

  setUserAuthId(authId: string) {
    this.userAuthId = authId;
    this.getBoardInfo();
  }

  getBoardInfo() {
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

      let users: Array<User> = [];
      let currentUser: User = null;
      boardSnapshot.child("users").forEach((usersSnapshot: DataSnapshot) => {
        let user: User = new User(usersSnapshot.key, usersSnapshot.val().authId, usersSnapshot.val().userNumber, usersSnapshot.val().name);
        users.push(user);

        if (this.userAuthId === usersSnapshot.val().authId) {
          currentUser = user;
        }
        return false;
      });
      let userMap: Map<string, User> = new Map<string, User>();
      users.forEach((user: User) => userMap.set(user.key, user));

      let boardTitle: string = boardSnapshot.child("title").val();

      this.setState({columns: columns, userMap: userMap, boardTitle: boardTitle, user: currentUser});

    });
  }

  addCard(colKey: string) {
    return () => {
      let newCardRef = this.columnsRef.child(colKey).child("cards").push();
      newCardRef.set({text: "", isEditing: true, userKey: this.state.user.key, isHidden: true});
    };
  }

  deleteCard(colKey: string, cardKey: string): () => void {
    return () => {
      this.columnsRef.child(colKey).child("cards").child(cardKey).remove();
    };
  }

  setEditCard(colKey: string, cardKey: string): () => void {
    return () => {
      this.columnsRef.child(colKey).child("cards").child(cardKey).update({isEditing: true});
    };
  }

  saveCard(colKey: string, cardKey: string): (text: string, isHidden: boolean) => void {
    return (text: string, isHidden: boolean) => {
      this.columnsRef.child(colKey).child("cards").child(cardKey).update({
        isEditing: false,
        isHidden: isHidden,
        text: text
      });
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

  closeModalRemoveColumn() {
    this.setState({removeColumnModalOpen: false});
  }

  askRemoveColumn(columnKey: string, columnTitle: string) {
    this.setState({removeColumnTitle: columnTitle, removeColumnKey: columnKey, removeColumnModalOpen: true});
  }

  removeColumn() {
    this.columnsRef.child(this.state.removeColumnKey).remove();
    this.setState({removeColumnTitle: "", removeColumnKey: "", removeColumnModalOpen: false});
  }

  importCard(targetColumnKey: string) {
    return (cardKey: string, sourceColumnKey: string) => {
      if (!cardKey || !sourceColumnKey || !targetColumnKey) {
        console.log("DragNDrop Fail");
        console.log("cardKey", cardKey);
        console.log("sourceColumnKey", sourceColumnKey);
        console.log("targetColumnKey", targetColumnKey);
        return;
      }
      if (sourceColumnKey === targetColumnKey) {
        return;
      }
      this.columnsRef.child(sourceColumnKey).child("cards").child(cardKey).once("value", (cardSnapshot: DataSnapshot) => {
        let card: Card = Card.fromSnapshot(cardSnapshot);
        let newCardRef: Reference = this.columnsRef.child(targetColumnKey).child("cards").push();
        card.saveInReference(newCardRef);
      });
      this.columnsRef.child(sourceColumnKey).child("cards").child(cardKey).remove();
    }
  }

  updateTitle(title: string) {
    this.boardRef.update({title: title});
  }

  updateColumnTitle(columnKey: string) {
    return (title: string) => {
      this.columnsRef.child(columnKey).update({title: title});
    }
  }

  updateUserName(name: string) {
    this.boardRef.child("users").child(this.state.user.key).update({name: name});
  }

  render() {

    if (!this.state.user) {
      return <div/>;
    }

    const cols = this.state.columns.map((column: Column, index: number) => {
      return <ColumnComponent key={index} column={column} colNb={this.state.columns.length}
                              addCard={this.addCard(column.key)}
                              deleteCard={(cardKey: string) => this.deleteCard(column.key, cardKey)}
                              setEditCard={(cardKey: string) => this.setEditCard(column.key, cardKey)}
                              saveCard={(cardKey: string) => this.saveCard(column.key, cardKey)}
                              user={this.state.user}
                              userMap={this.state.userMap}
                              removeColumn={() => this.askRemoveColumn(column.key, column.title)}
                              importCard={this.importCard(column.key)}
                              updateColumnTitle={(title: string) => this.updateColumnTitle(column.key)(title)}
      />;
    });

    return <div>

      <Head boardTitle={this.state.boardTitle}
            updateTitle={(title: string) => this.updateTitle(title)}
            user={this.state.user}
            updateUserName={(name: string) => this.updateUserName(name)}
            userMap={this.state.userMap}
      />

      <div className="row my-row">
        {this.state.columns.length < 6 &&
        <Button className="add-column-button" bsSize="xs" bsStyle="primary" onClick={() => this.openModalNewCol()}>
          Add column
        </Button>
        }
        {cols}
      </div>

      <Modal show={this.state.newColModalOpen} onHide={() => this.closeModalNewCol()} bsSize="small">
        <Modal.Header closeButton>
          <Modal.Title>New Column</Modal.Title>
        </Modal.Header>
        <Modal.Body>


          <form className="form-horizontal" action="#" onSubmit={() => this.addCol()}>

            <div className="form-group">
              <label htmlFor="newColName" className="col-lg-2 control-label">Name</label>
              <div className="col-lg-9">
                <input type="text" id="newColName" className="form-control"
                       onChange={(event: any) => this.onChangeNewColName(event)}
                       value={this.state.newColName}
                       autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <div className="col-lg-10 col-lg-offset-2">
                <Button bsStyle="primary" type="button" onClick={() => this.addCol()}>Add</Button>
              </div>
            </div>

          </form>
        </Modal.Body>
      </Modal>


      <Modal show={this.state.removeColumnModalOpen} onHide={() => this.closeModalRemoveColumn()}>
        <Modal.Header closeButton>
          <Modal.Title>Remove column "{this.state.removeColumnTitle}" ?</Modal.Title>
        </Modal.Header>
        <Modal.Footer>
          <Button bsStyle="default" type="button" onClick={() => this.closeModalRemoveColumn()}>Cancel</Button>
          <Button bsStyle="primary" type="button" onClick={() => this.removeColumn()}>Remove</Button>
        </Modal.Footer>
      </Modal>


    </div>;
  }

}

export
default
Board;