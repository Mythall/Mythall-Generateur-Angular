import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { switchMap, tap } from 'rxjs/operators';
import * as firebase from 'firebase';
import { UserService, IUser } from './user.service';
import { MatDialog } from '@angular/material/dialog';
import { ErrorDialogComponent } from '../../layout/dialogs/error/error.dialog.component';
import { Observable, of } from 'rxjs';

@Injectable()
export class AuthenticationService {

  public user$: Observable<IUser>;
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
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.afs.doc<IUser>(`users/${user.uid}`).valueChanges();
        } else {
          return of(null)
        }
      }),
      tap(user => this.user = user)
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
        this.dialog.open(ErrorDialogComponent, {
          data: error.message
        });
      });
  }

  private async updateUserData(user: any): Promise<void> {

    //Create new User
    let updatedUser = {
      roles: {
        joueur: true,
      },
    } as IUser;

    //Update Data from Credentials
    updatedUser.uid = user.uid;
    updatedUser.displayname = user.displayName;
    updatedUser.email = user.email;
    updatedUser.photoURL = user.photoURL;

    const userDB = await this.userService.getUser(updatedUser.uid);

    if (!userDB) {
      updatedUser.createdAt = new Date();
      updatedUser.roles = { ...updatedUser.roles };
      await this.userService.addUser(updatedUser);
    } else {
      updatedUser = { ...updatedUser, ...userDB };
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