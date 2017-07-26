import * as React from "react";
import {Button} from "react-bootstrap";

import {Card, Column, User} from "../Utils/Types";
import CardComponent from "./CardComponent";

interface ColumnComponentProps {
  column: Column;
  colNb: number;
  addCard: () => void;
  deleteCard: (colId: string, cardId: string) => (() => void);
  setEditCard: (colId: string, cardId: string) => (() => void);
  saveCard: (colId: string, cardId: string) => (text: string, isHidden: boolean) => void;
  user: User;
  userMap: Map<string, User>;
  removeColumn: () => void;
}

class ColumnComponent extends React.Component<ColumnComponentProps, any> {

  constructor(props: ColumnComponentProps) {
    super(props);

  }

  render() {
    const cards = this.props.column.cards.map((card: Card) => {
      return <CardComponent key={card.id} card={card}
                            deleteCard={this.props.deleteCard(this.props.column.id, card.id)}
                            setEditCard={this.props.setEditCard(this.props.column.id, card.id)}
                            saveCard={this.props.saveCard(this.props.column.id, card.id)}
                            user={this.props.user}
                            userMap={this.props.userMap}

      />;
    });

    return (
        <div className={"col-" + this.props.colNb}>

          <i className="fa fa-times remove-column-icon" aria-hidden="true" onClick={() => this.props.removeColumn()}/>
          <span className="column-title"> {this.props.column.title}</span>

          <i className="fa fa-plus add-card-icon" aria-hidden="true" onClick={() => this.props.addCard()}/>

          {cards}
        </div>);
  }


}

export default ColumnComponent;