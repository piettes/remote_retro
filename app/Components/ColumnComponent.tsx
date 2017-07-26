import * as React from "react";

import {Card, Column, User} from "../Utils/Types";
import CardComponent from "./CardComponent";
import EditableTitle from "./EditableTitle";

interface ColumnComponentProps {
  column: Column;
  colNb: number;
  addCard: () => void;
  deleteCard: (cardKey: string) => (() => void);
  setEditCard: (cardKey: string) => (() => void);
  saveCard: (cardKey: string) => (text: string, isHidden: boolean) => void;
  user: User;
  userMap: Map<string, User>;
  removeColumn: () => void;
  importCard: (cardKey: string, sourceColumnKey: string) => void;
  updateColumnTitle: (title: string) => void;
}

class ColumnComponent extends React.Component<ColumnComponentProps, any> {

  constructor(props: ColumnComponentProps) {
    super(props);
  }

  drop(event: any) {
    event.preventDefault();
    let cardKey = event.dataTransfer.getData("cardKey");
    let sourceColumnKey = event.dataTransfer.getData("columnKey");
    this.props.importCard(cardKey, sourceColumnKey);
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  render() {
    const cards = this.props.column.cards.map((card: Card) => {
      return <CardComponent key={card.key} card={card}
                            deleteCard={this.props.deleteCard(card.key)}
                            setEditCard={this.props.setEditCard(card.key)}
                            saveCard={this.props.saveCard(card.key)}
                            user={this.props.user}
                            userMap={this.props.userMap}
                            columnKey={this.props.column.key}
      />;
    });


    return (
        <div className={"col-" + this.props.colNb} onDrop={(event: any) => this.drop(event)}
             onDragOver={(event: any) => this.allowDrop(event)}>

          <i className="fa fa-times remove-column-icon" aria-hidden="true" onClick={this.props.removeColumn}/>

          <EditableTitle title={this.props.column.title} size="medium" updateTitle={this.props.updateColumnTitle}/>

          <i className="fa fa-plus add-card-icon" aria-hidden="true" onClick={this.props.addCard}/>

          {cards}
        </div>);
  }


}

export default ColumnComponent;