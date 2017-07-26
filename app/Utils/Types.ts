import * as firebase from "firebase";
import DataSnapshot = firebase.database.DataSnapshot;
import Reference = firebase.database.Reference;

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

  static fromSnapshot(cardSnapshot: DataSnapshot): Card {
    return new Card(cardSnapshot.key,
        cardSnapshot.val().text,
        cardSnapshot.val().userId,
        cardSnapshot.val().isEditing,
        cardSnapshot.val().isHidden);
  }

  saveInReference(cardReference: Reference): void {
    cardReference.set({text: this.text, isEditing: this.isEditing, userId: this.userId, isHidden: this.isHidden});
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