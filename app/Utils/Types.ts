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

  save(cardReference: Reference): void {
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

function getEmptyMood(): string {
  let mood = [];
  for (let i = 0; i < 7; i++) {
    mood.push(0);
  }
  return mood.join(",");
}

export class User {
  key: string;
  authId: string;
  userNumber: number;
  name: string;
  moodPoints: string;
  hideMood: boolean;

  private constructor(key: string, authId: string, userNumber: number, name: string, moodPoints: string, hideMood: boolean) {
    this.key = key;
    this.authId = authId;
    this.userNumber = userNumber;
    this.name = name;
    this.moodPoints = moodPoints;
    this.hideMood = hideMood;
  }

  static fromSnapshot(usersSnapshot: DataSnapshot): User {
    let moodPoints = usersSnapshot.val().moodPoints ? usersSnapshot.val().moodPoints : getEmptyMood();
    let hideMood = usersSnapshot.val().hideMood !== false;
    return new User(usersSnapshot.key, usersSnapshot.val().authId, usersSnapshot.val().userNumber,
        usersSnapshot.val().name, moodPoints, hideMood);
  }
}

export class Colors {
  static get(id: number): string {
    switch (id) {
      case 0:
      case 12:
      case 24:
        return "#2196f3";
      case 1:
      case 13:
      case 25:
        return "#9c27b0";
      case 2:
      case 14:
      case 26:
        return "#ff9800";
      case 3:
      case 15:
      case 27:
        return "#4caf50";
      case 4:
      case 16:
      case 28:
        return "#e51c23";
      case 5:
      case 17:
      case 29:
        return "#00bcd4";
      case 6:
      case 18:
      case 30:
        return "#673ab7";
      case 7:
      case 19:
      case 31:
        return "#ff5722";
      case 8:
      case 20:
      case 32:
        return "#8bc34a";
      case 9:
      case 21:
      case 33:
        return "#e91e63";
      case 10:
      case 22:
      case 34:
        return "#9e9e9e";
      case 11:
      case 23:
      case 35:
        return "#795548"
    }
  }
}