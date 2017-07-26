import * as firebase from "firebase";
import DataSnapshot = firebase.database.DataSnapshot;
import Reference = firebase.database.Reference;

class Auth {

  boardRef: Reference;
  setUserIdCallback: (authId: string) => void;

  constructor(boardRef: Reference, setUserIdCallback: (authId: string) => void) {
    this.boardRef = boardRef;
    this.setUserIdCallback = setUserIdCallback;
  }

  // TODO make it return a promise
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

  save(authId: string) {
    console.log("user authId", authId);
    let usersRef = this.boardRef.child("/users");
    usersRef.once("value", (usersSnapshot: DataSnapshot) => {
      let userAlreadyExists: boolean = false;
      let userKey: string = "";
      usersSnapshot.forEach((userSnapShot: DataSnapshot) => {
        if (userSnapShot.val().authId === authId) {
          userAlreadyExists = true;
          userKey = userSnapShot.key;
        }
        return false;
      });

      if (userAlreadyExists) {
        usersRef.child("/" + userKey).once("value", (userSnapShot: DataSnapshot) => {
          this.setUserIdCallback(authId);
        });
      } else {
        let userRef = usersRef.push();
        userRef.set({authId: authId, userNumber: usersSnapshot.numChildren(), name: ""});
        this.setUserIdCallback(authId);
      }
    });
  }

}

export default Auth;