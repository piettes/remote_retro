import * as React from "react";
import {Button} from "react-bootstrap";

import {Card, Column, User} from "./Types";
import CardComponent from "./CardComponent";

interface ColumnComponentProps {
  column: Column;
  colNb: number;
  addCard: () => void;
  deleteCard: (colId: string, cardId: string) => (() => void);
  setEditCard: (colId: string, cardId: string) => (() => void);
  saveCard: (colId: string, cardId: string) => (text: string) => void;
  user: User;
  userMap: Map<string, User>;
}

class ColumnComponent extends React.Component<ColumnComponentProps, any> {

  constructor(props: ColumnComponentProps) {
    super(props);

    this.onAddCard = this.onAddCard.bind(this);
  }

  onAddCard() {
    this.props.addCard();
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

          {this.props.column.title}

          <Button bsSize="xs" bsStyle="primary" onClick={this.onAddCard}>
            <i className="fa fa-plus" aria-hidden="true"/>
          </Button>

          {cards}
        </div>);
  }


}

export default ColumnComponent;