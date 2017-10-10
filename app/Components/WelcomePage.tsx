import * as React from "react";
import {ChangeEvent} from "react";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";

import * as firebase from "firebase";
import Reference = firebase.database.Reference;

// https://stackoverflow.com/a/2117523/709863
function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

interface WelcomePageProps extends RouteComponentProps<any> {
}

class WelcomePage extends React.Component<WelcomePageProps, any> {

  constructor() {
    super();
    this.state = {boardTitle: ""};
  }

  createBoard() {
    let uuid = uuidv4();

    let boardRef: Reference = firebase.database().ref("boards/" + uuid);
    boardRef.set({title: this.state.boardTitle, datum: Date.now()});

    this.addColumn(boardRef, "The Good");
    this.addColumn(boardRef, "The Bad");
    this.addColumn(boardRef, "The Ugly");

    this.props.history.push("retro/" + uuid + "/board");
  }

  addColumn(boardRef: Reference, name: string) {
    let newColRef = boardRef.child("columns").push();
    newColRef.set({title: name});
  }

  onChangeName(event: ChangeEvent<HTMLInputElement>): void {
    this.setState({boardTitle: event.target.value});
  }

  render() {

    return (
        <div className="container">

          <h1>Welcome to Remote Retro</h1>

          <br/>
          <h5>Create a new board to start</h5>
          <br/>
          <br/>
          <form className="form-horizontal" action="#" onSubmit={() => this.createBoard()}>
            <fieldset>
              <div className="form-group">
                <label htmlFor="boardName" className="col-lg-2 control-label">Board Name</label>
                <div className="col-lg-3">
                  <input type="text"
                         className="form-control"
                         value={this.state.boardName}
                         id="boardName"
                         placeholder="My New Board"
                         onChange={(event: ChangeEvent<HTMLInputElement>) => this.onChangeName(event)}/>
                </div>
              </div>

              <div className="form-group">
                <div className="col-lg-10 col-lg-offset-2">
                  <button type="button" className="btn btn-primary" onClick={() => this.createBoard()}>Create new
                    board
                  </button>
                </div>
              </div>

            </fieldset>
          </form>


        </div>
    );
  }
}

export default withRouter<any>(WelcomePage);