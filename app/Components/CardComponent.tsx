import * as React from "react";

import {Card, User} from "../Utils/Types";

interface CardComponentProps {
  card: Card;
  deleteCard: () => void;
  setEditCard: () => void;
  saveCard: (text: string, idHidden: boolean) => void;
  user: User;
  userMap: Map<string, User>;
}

class CardComponent extends React.Component<CardComponentProps, any> {

  constructor(props: CardComponentProps) {
    super(props);

    this.state = {
      text: props.card.text ? props.card.text : "",
      isHidden: props.card.isHidden
    };
  }

  onChangeText(event: any) {
    this.setState({text: event.target.value});
  }

  onChangeHidden() {
    this.setState({isHidden: !this.state.isHidden});
  }

  renderOtherHiddenCard() {
    return (
        <div className={"card card-other-hidden card-color-" + this.props.userMap.get(this.props.card.userId).userNumber}>
          <span unselectable>{this.props.card.text}</span>
        </div>
    );
  }

  renderOtherCard() {
    return (
        <div className={"card card-color-" + this.props.userMap.get(this.props.card.userId).userNumber}>
          <div className="card-container">
            {this.props.card.text}
          </div>
        </div>
    );
  }

  renderHiddenCard() {
    return (
        <div className={"card card-hidden card-color-" + this.props.userMap.get(this.props.card.userId).userNumber}>
          {this.props.card.text}
          <i className="fa fa-pencil card-edit-icon" aria-hidden="true" onClick={this.props.setEditCard}/>
          <span className="text-button card-show-button"
                onClick={() => this.props.saveCard(this.state.text, false)}>show</span>
        </div>
    );
  }

  renderEditingCard() {
    return (
        <div className={"card-editable card-color-" + this.props.userMap.get(this.props.card.userId).userNumber}>
          <div className="card-container">
            <textarea autoFocus onChange={(event: any) => this.onChangeText(event)} value={this.state.text}/>
            <i className="fa fa-trash card-remove-icon" aria-hidden="true" onClick={this.props.deleteCard}/>
            <form className="form-inline">
              <span onClick={() => this.props.saveCard(this.state.text, this.state.isHidden)}
                      className="text-button">Save</span>
              <div className="checkbox hidden-checkbox">
                <label >
                  <input type="checkbox" value={this.state.isHidden} checked={this.state.isHidden}
                         onChange={() => this.onChangeHidden()}/> Hidden
                </label>
              </div>
            </form>
          </div>
        </div>
    );
  }

  renderCard() {
    return (
        <div className={"card card-color-" + this.props.userMap.get(this.props.card.userId).userNumber}>
            {this.props.card.text}
            <i className="fa fa-pencil card-edit-icon" aria-hidden="true" onClick={this.props.setEditCard}/>
            <span className="text-button card-hide-button"
                    onClick={() => this.props.saveCard(this.state.text, true)}>hide</span>
        </div>
    );
  }

  render() {
    if (this.props.card.userId !== this.props.user.userId) {
      if (this.props.card.isHidden || this.props.card.isEditing) {
        return this.renderOtherHiddenCard();
      }
      return this.renderOtherCard();
    }
    if (this.props.card.isEditing) {
      return this.renderEditingCard();
    }
    if (this.props.card.isHidden) {
      return this.renderHiddenCard();
    }
    return this.renderCard();
  }
}

export default CardComponent;