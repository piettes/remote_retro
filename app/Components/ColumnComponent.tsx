import * as React from "react";

import {Card, Column, User} from "../Utils/Types";
import CardComponent from "./CardComponent";

interface ColumnComponentProps {
  column: Column;
  colNb: number;
  addCard: () => void;
  deleteCard: (cardId: string) => (() => void);
  setEditCard: (cardId: string) => (() => void);
  saveCard: (cardId: string) => (text: string, isHidden: boolean) => void;
  user: User;
  userMap: Map<string, User>;
  removeColumn: () => void;
  importCard: (cardId: string, sourceColumnI: string) => void;
}

class ColumnComponent extends React.Component<ColumnComponentProps, any> {

  constructor(props: ColumnComponentProps) {
    super(props);
  }

  drop(event: any) {
    event.preventDefault();
    let cardId = event.dataTransfer.getData("cardId");
    let sourceColumnId = event.dataTransfer.getData("columnId");
    this.props.importCard(cardId, sourceColumnId);
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  render() {
    const cards = this.props.column.cards.map((card: Card) => {
      return <CardComponent key={card.id} card={card}
                            deleteCard={this.props.deleteCard(card.id)}
                            setEditCard={this.props.setEditCard(card.id)}
                            saveCard={this.props.saveCard(card.id)}
                            user={this.props.user}
                            userMap={this.props.userMap}
                            columnId={this.props.column.id}
      />;
    });


    return (
        <div className={"col-" + this.props.colNb} onDrop={(event: any) => this.drop(event)}
             onDragOver={(event: any) => this.allowDrop(event)}>

          <i className="fa fa-times remove-column-icon" aria-hidden="true" onClick={() => this.props.removeColumn()}/>
          <span className="column-title"> {this.props.column.title}</span>

          <i className="fa fa-plus add-card-icon" aria-hidden="true" onClick={() => this.props.addCard()}/>

          {cards}
        </div>);
  }


}

export default ColumnComponent;