import * as React from "react";
import EditableTitle from "./EditableTitle";
import {User} from "../Utils/Types";

interface HeadProps {
  boardTitle: string;
  updateTitle: (title: string) => void;
  user: User;
  updateUserName: (name: string) => void;
  userMap: Map<string, User>;
}

interface HeadState {
}

class Head extends React.Component<HeadProps, HeadState> {

  constructor(props: HeadProps) {
    super(props);

  }

  userListDisplay() {
    return Array.from(this.props.userMap.values()).map((user: User) => {
      return <li key={user.key}
                 className={"card-color-" + user.userNumber}>{user.name === "" ? "Anonymous" : user.name}</li>
    });
  }

  render() {
    return <div className="head">

      <div className="row">

        <div className="col-lg-6">
          <EditableTitle title={this.props.boardTitle} updateTitle={this.props.updateTitle} size="large"/>
        </div>

        <div className="col-lg-3">

          Your name :
          <EditableTitle title={this.props.user.name} updateTitle={this.props.updateUserName}
                         size="medium" placeHolder={"Enter you name here"}/>
        </div>

        <div className="col-lg-3 user-list">
          <ul>{this.userListDisplay()}</ul>
        </div>

      </div>

    </div>
  }
}

export default Head;