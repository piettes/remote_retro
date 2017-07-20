import * as firebase from "firebase";
import DataSnapshot = firebase.database.DataSnapshot;
import Reference = firebase.database.Reference;
import {User} from "./Types";

class Auth {

  boardRef: Reference;
  setUserCallback: (user: User) => void;

  constructor(boardRef: Reference, setUser: (user: User) => void) {
    this.boardRef = boardRef;
    this.setUserCallback = setUser;
  }

  signIn() {

    firebase.auth().onAuthStateChanged((user: any) => {
      if (user) {
        // User is signed in.
        let isAnonymous = user.isAnonymous;
        let uid = user.uid;
        this.save(uid);
        // ...
      } else {
        // User is signed out.
        // ...
      }
      // ...
    });

    firebase.auth().signInAnonymously().catch((error: any) => {
      // Handle Errors here.
      let errorCode = error.code;
      let errorMessage = error.message;
      // ...
    });
  }

  save(userId: string) {
    console.log("userid", userId);
    let usersRef = this.boardRef.child("/users");
    usersRef.once("value", (usersSnapshot: DataSnapshot) => {
      let userAlreadyExists: boolean = false;
      let userKey: string = "";
      usersSnapshot.forEach((userSnapShot: DataSnapshot) => {
        if (userSnapShot.val().userId === userId) {
          userAlreadyExists = true;
          userKey = userSnapShot.key;
        }
        return false;
      });

      if (userAlreadyExists) {
        usersRef.child("/" + userKey).once("value", (userSnapShot: DataSnapshot) => {
          this.setUser(userId, userSnapShot.val().userNumber );
        });
      } else {
        let userRef = usersRef.push();
        userRef.set({userId: userId, userNumber: usersSnapshot.numChildren()});
        this.setUser(userId, usersSnapshot.numChildren() );
      }
    });
  }

  setUser(userId: string, userNumber: number) {
   this.setUserCallback(new User(userId, userNumber))
  }

}

export default Auth;