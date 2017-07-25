export class Card {

  text: string;
  id: string;
  isEditing: boolean;
  userId: string;
  isHidden: boolean;

  constructor(id: string, text: string, userId: string, isEditing: boolean, isHidden: boolean) {
    this.id = id;
    this.text = text;
    this.isEditing = isEditing;
    this.userId = userId;
    this.isHidden = isHidden;
  }

}

export class Column {

  title: string;
  id: string;
  cards: Array<Card> = [];

  constructor(id: string, title: string) {
    this.title = title;
    this.id = id;
  }

  addCard(card: Card): void {
    this.cards.push(card);
  }

}

export class User {
  userId: string;
  userNumber: number;

  constructor(userId: string, userNumber: number) {
    this.userId = userId;
    this.userNumber = userNumber;
  }
}