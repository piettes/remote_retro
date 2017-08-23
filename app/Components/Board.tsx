import * as React from "react";
import {Button, Modal} from "react-bootstrap";

import * as firebase from "firebase";
import DataSnapshot = firebase.database.DataSnapshot;
import Reference = firebase.database.Reference;

import * as autosize from "autosize";

import {Card, Column, User} from "../Utils/Types";
import ColumnComponent from "./ColumnComponent";
import {RouteComponentProps, withRouter} from "react-router";

interface BoardState {
  newColModalOpen: boolean;
  removeColumnModalOpen: boolean;
  newColName: string;
  removeColumnTitle: string;
  removeColumnKey: string;
}

interface BoardProps extends RouteComponentProps<any> {
  user: User;
  userMap: Map<string, User>;
  columns: Array<Column>;
}

declare let process: any;

class Board extends React.Component<BoardProps, BoardState> {

  columnsRef: Reference;

  constructor(props: BoardProps) {
    super(props);

    this.state = {
      newColModalOpen: false,
      removeColumnModalOpen: false,
      newColName: "",
      removeColumnTitle: "",
      removeColumnKey: ""
    };
  }

  componentDidMount() {
    this.columnsRef = firebase.database().ref("boards/" + this.props.match.params.id).child("columns");
  }

  componentDidUpdate() {
    let c: any = jQuery("textarea");
    autosize(c);
  }

  addCard(colKey: string) {
    return () => {
      let newCardRef = this.columnsRef.child(colKey).child("cards").push();
      newCardRef.set({text: "", isEditing: true, userKey: this.props.user.key, isHidden: true});
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
        card.save(newCardRef);
      });
      this.columnsRef.child(sourceColumnKey).child("cards").child(cardKey).remove();
    }
  }

  updateColumnTitle(columnKey: string) {
    return (title: string) => {
      this.columnsRef.child(columnKey).update({title: title});
    }
  }


  render() {

    if (!this.props.user) {
      return <div/>;
    }

    const cols = this.props.columns.map((column: Column, index: number) => {
      return <ColumnComponent key={index} column={column} colNb={this.props.columns.length}
                              addCard={this.addCard(column.key)}
                              deleteCard={(cardKey: string) => this.deleteCard(column.key, cardKey)}
                              setEditCard={(cardKey: string) => this.setEditCard(column.key, cardKey)}
                              saveCard={(cardKey: string) => this.saveCard(column.key, cardKey)}
                              user={this.props.user}
                              userMap={this.props.userMap}
                              removeColumn={() => this.askRemoveColumn(column.key, column.title)}
                              importCard={this.importCard(column.key)}
                              updateColumnTitle={(title: string) => this.updateColumnTitle(column.key)(title)}
      />;
    });

    return <div className="row my-row">

      <div>
        {this.props.columns.length < 6 &&
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

export default withRouter<any>(Board);;