import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import * as firebase from 'firebase';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestoreDocument, AngularFirestore } from '@angular/fire/firestore';

import { UserService, IUser } from './user.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../../layout/dialogs/error/error.dialog.component';

@Injectable()
export class AuthenticationService {

  public user: IUser;

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
    private dialog: MatDialog,
    private router: Router,
    private userService: UserService
  ) {
    this.setUser();
  }

  private setUser() {
    this.afAuth.authState.pipe(
      switchMap(async (user) => {
        if (user) {
          this.user = await this.userService.getUser(user.uid);
        } else {
          this.user = null;
        }
      })
    )
  }

  facebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.oAuthLogin(provider);
  }

  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider()
    return this.oAuthLogin(provider);
  }

  logout() {
    this.afAuth.auth.signOut().then(() => {
      this.router.navigate([""]);
    });
  }

  private oAuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential: firebase.auth.UserCredential) => {
        this.updateUserData(credential.user)
      }).then(
        () => this.router.navigate([""])
      ).catch(error => {
        let dialogRef = this.dialog.open(ErrorDialogComponent, {
          data: error.message
        });
      });
  }

  private async updateUserData(user: any): Promise<void> {

    //Create new User
    let updatedUser = {
      roles: {
        joueur: true,
      }
    } as IUser;

    //Update Data from Credentials
    updatedUser.uid = user.uid;
    updatedUser.displayname = user.displayName;
    updatedUser.email = user.email;
    updatedUser.photoURL = user.photoURL;
    updatedUser.createdAt = new Date(); // firebase.firestore.Timestamp.now();

    const userDB = await this.userService.getUser(updatedUser.uid);

    if (!userDB) {
      updatedUser.roles = { ...updatedUser.roles };
      await this.userService.addUser(updatedUser);
    } else {
      updatedUser.updatedAt = new Date();
      await this.userService.updateUser(updatedUser);
    }
  }

  isJoueur(user: IUser): boolean {
    const allowed = ['organisateur', 'animateur', 'joueur']
    return this.checkAuthorization(user, allowed)
  }

  isAnimateur(user: IUser): boolean {
    const allowed = ['organisateur', 'animateur']
    return this.checkAuthorization(user, allowed)
  }

  isOrganisateur(user: IUser): boolean {
    const allowed = ['organisateur']
    return this.checkAuthorization(user, allowed)
  }

  private checkAuthorization(user: IUser, allowedRoles: string[]): boolean {
    if (!user) return false
    for (const role of allowedRoles) {
      if (user) {
        if (user.roles[role]) {
          return true
        }
      }
    }
    return false
  }


}