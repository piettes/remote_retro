import * as React from "react";
import {ChangeEvent} from "react";
import {Button} from "react-bootstrap";

interface EditableTitleProps {
  title: string;
  updateTitle: (title: string) => void;
  size: "medium" | "large";
}

interface EditableTitleState {
  isEditing: boolean;
  title: string;
}

class EditableTitle extends React.Component<EditableTitleProps, EditableTitleState> {

  constructor(props: EditableTitleProps) {
    super(props);

    this.state = {
      isEditing: false,
      title: ""
    }
  }

  switchEditTitle() {
    this.setState({isEditing: true, title: this.props.title});
  }

  onChangeBoardTitle(event: ChangeEvent<HTMLInputElement>) {
    this.setState({title: event.target.value});
  }

  saveBoardTitle() {
    this.props.updateTitle(this.state.title);
    this.setState({isEditing: false});
  }

  cancel() {
    this.setState({isEditing: false, title: this.props.title});
  }

  render() {
    if (!this.state.isEditing) {
      return <div className={"editable-title-" + this.props.size}>
        <div className="editable-title-title col-lg-12"
             onClick={(event: any) => this.switchEditTitle() }>{this.props.title}</div>
      </div>
    }
    return <div className={"editable-title-" + this.props.size}>
      <form className="form-horizontal" action="#" onSubmit={() => this.saveBoardTitle()}>

        <div className="form-group">
          <label htmlFor="title-edit" className="control-label"/>
          <div className="col-lg-12">
            <input className="form-control" autoFocus type="text" id="title-edit" value={this.state.title}
                   onChange={(event: ChangeEvent<HTMLInputElement>) => this.onChangeBoardTitle(event)}/>
          </div>
        </div>

        <div className="form-group">
          <div className="col-lg-12">
            <Button bsSize="xs" bsStyle="primary" onClick={() => this.saveBoardTitle()}>
              Save
            </Button>
            <Button bsSize="xs" bsStyle="default" onClick={() => this.cancel()}>
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  }

}

export default EditableTitle;