import * as firebase from "firebase";
import DataSnapshot = firebase.database.DataSnapshot;
import Reference = firebase.database.Reference;

export class Card {

  text: string;
  key: string;
  isEditing: boolean;
  userKey: string;
  isHidden: boolean;

  private constructor(key: string, text: string, userKey: string, isEditing: boolean, isHidden: boolean) {
    this.key = key;
    this.text = text;
    this.isEditing = isEditing;
    this.userKey = userKey;
    this.isHidden = isHidden;
  }

  static fromSnapshot(cardSnapshot: DataSnapshot): Card {
    return new Card(cardSnapshot.key,
        cardSnapshot.val().text,
        cardSnapshot.val().userKey,
        cardSnapshot.val().isEditing,
        cardSnapshot.val().isHidden);
  }

  saveInReference(cardReference: Reference): void {
    cardReference.set({text: this.text, isEditing: this.isEditing, userKey: this.userKey, isHidden: this.isHidden});
  }

}

export class Column {

  title: string;
  key: string;
  cards: Array<Card> = [];

  constructor(key: string, title: string) {
    this.title = title;
    this.key = key;
  }

  addCard(card: Card): void {
    this.cards.push(card);
  }

}

export class User {
  key: string;
  authId: string;
  userNumber: number;
  name: string;

  constructor(key: string, authId: string, userNumber: number, name: string) {
    this.key = key;
    this.authId = authId;
    this.userNumber = userNumber;
    this.name = name;
  }
}