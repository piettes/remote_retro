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
  removeColumnId: string;
}

interface BoardProps {
  match: any;
}

declare let process: any;

class Board extends React.Component<BoardProps, BoardState> {

  columnsRef: Reference;
  boardRef: Reference;
  auth: Auth;

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
      removeColumnId: ""
    };

    this.setUser = this.setUser.bind(this);
    // this.openModalNewCol = this.openModalNewCol.bind(this);
  }

  componentDidMount() {
    this.boardRef = firebase.database().ref("boards/" + this.props.match.params.id);

    // TODO use promise
    this.auth = new Auth(this.boardRef, this.setUser);
    this.auth.signIn();
    this.getBoardInfo();

    this.columnsRef = this.boardRef.child("columns");
  }

  componentDidUpdate() {
    let c: any = jQuery("textarea");
    autosize(c);
  }

  setUser(user: User) {
    this.setState({user: user});
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
      boardSnapshot.child("users").forEach((usersSnapshot: DataSnapshot) => {
        let user: User = new User(usersSnapshot.val().userId, usersSnapshot.val().userNumber);
        users.push(user);
        return false;
      });
      let userMap: Map<string, User> = new Map<string, User>();
      users.forEach((user: User) => userMap.set(user.userId, user));

      let boardTitle: string = boardSnapshot.child("title").val();

      this.setState({columns: columns, userMap: userMap, boardTitle: boardTitle});

    });
  }

  addCard(colId: string) {
    return () => {
      let newCardRef = this.columnsRef.child(colId).child("cards").push();
      newCardRef.set({text: "", isEditing: true, userId: this.state.user.userId, isHidden: true});
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

  saveCard(colId: string, cardId: string): (text: string, isHidden: boolean) => void {
    return (text: string, isHidden: boolean) => {
      this.columnsRef.child(colId).child("cards").child(cardId).update({
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

  askRemoveColumn(colId: string, colTitle: string) {
    this.setState({removeColumnTitle: colTitle, removeColumnId: colId, removeColumnModalOpen: true});
  }

  removeColumn() {
    this.columnsRef.child(this.state.removeColumnId).remove();
    this.setState({removeColumnTitle: "", removeColumnId: "", removeColumnModalOpen: false});
  }

  importCard(targetColumnId: string) {
    return (cardId: string, sourceColumnId: string) => {
      if (!cardId || !sourceColumnId || !targetColumnId) {
        console.log("DragNDrop Fail");
        console.log("cardId", cardId);
        console.log("sourceColumnId", sourceColumnId);
        console.log("targetColumnId", targetColumnId);
        return;
      }
      if (sourceColumnId === targetColumnId) {
        return;
      }
      this.columnsRef.child(sourceColumnId).child("cards").child(cardId).once("value", (cardSnapshot: DataSnapshot) => {
        let card: Card = Card.fromSnapshot(cardSnapshot);
        let newCardRef: Reference = this.columnsRef.child(targetColumnId).child("cards").push();
        card.saveInReference(newCardRef);
      });
      this.columnsRef.child(sourceColumnId).child("cards").child(cardId).remove();
    }
  }

  updateTitle(title: string) {
    this.boardRef.update({title: title});
  }

  updateColumnTitle(columnId: string) {
    return (title: string) => {
      this.columnsRef.child(columnId).update({title: title});
    }
  }

  render() {

    if (!this.state.user) {
      return <div/>;
    }

    const cols = this.state.columns.map((column: Column, index: number) => {
      return <ColumnComponent key={index} column={column} colNb={this.state.columns.length}
                              addCard={this.addCard(column.id)}
                              deleteCard={(cardId: string) => this.deleteCard(column.id, cardId)}
                              setEditCard={(cardId: string) => this.setEditCard(column.id, cardId)}
                              saveCard={(cardId: string) => this.saveCard(column.id, cardId)}
                              user={this.state.user}
                              userMap={this.state.userMap}
                              removeColumn={() => this.askRemoveColumn(column.id, column.title)}
                              importCard={this.importCard(column.id)}
                              updateColumnTitle={(title: string) => this.updateColumnTitle(column.id)(title)}
      />;
    });

    return <div>

      <div className="container">

        <Head boardTitle={this.state.boardTitle} updateTitle={(title: string) => this.updateTitle(title)}/>

      </div>

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