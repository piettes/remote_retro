import * as React from "react";
import EditableTitle from "./EditableTitle";

interface HeadProps {
  boardTitle: string;
  updateTitle: (title: string) => void;
}

interface HeadState {
}

class Head extends React.Component<HeadProps, HeadState> {

  constructor(props: HeadProps) {
    super(props);

  }

  render() {
    return <div className="head">
      <EditableTitle title={this.props.boardTitle} updateTitle={this.props.updateTitle} size="large"/>
    </div>
  }
}

export default Head;