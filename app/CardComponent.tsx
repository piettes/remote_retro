import * as React from "react";

import {Card, User} from "./Types";
import {Button} from "react-bootstrap";

interface CardComponentProps {
  card: Card;
  deleteCard: () => void;
  setEditCard: () => void;
  saveCard: (text: string) => void;
  user: User;
  userMap: Map<string, User>;
}

class CardComponent extends React.Component<CardComponentProps, any> {

  constructor(props: CardComponentProps) {
    super(props);

    this.onChangeText = this.onChangeText.bind(this);
    this.onSave = this.onSave.bind(this);
    this.state = {text: props.card.text ? props.card.text : ""};
  }

  onChangeText(event: any) {
    this.setState({text: event.target.value});
  }

  onSave() {
    this.props.saveCard(this.state.text);
  }

  render() {
    if (this.props.card.isEditing && this.props.card.userId === this.props.user.userId)
      return (
          <div className={"card-editable card-color-" + this.props.userMap.get(this.props.card.userId).userNumber}>
            <div className="card-container">
              <textarea autoFocus onChange={this.onChangeText} value={this.state.text}/>
              <i className="fa fa-trash card-remove-icon" aria-hidden="true" onClick={this.props.deleteCard}/>
              <Button bsSize="xs" onClick={this.onSave} className="card-save-button">Save</Button>
            </div>
          </div>
      );

    return (
        <div className={"card card-color-" + this.props.userMap.get(this.props.card.userId).userNumber}>
          <div className="card-container">
            {this.props.card.text}
            {this.props.card.userId === this.props.user.userId &&
            <i className="fa fa-pencil card-edit-icon" aria-hidden="true" onClick={this.props.setEditCard}/>
            }
          </div>
        </div>
    );
  }

}

export default CardComponent;