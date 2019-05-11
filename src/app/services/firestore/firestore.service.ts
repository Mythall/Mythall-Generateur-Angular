import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';

import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import * as firebase from 'firebase';

import { MatSnackBar } from '@angular/material';

type CollectionPredicate<T> = string | AngularFirestoreCollection<T>;
type DocPredicate<T> = string | AngularFirestoreDocument<T>;

@Injectable()
export class FirestoreService {

  constructor(
    public afs: AngularFirestore,
    private snackBar: MatSnackBar
  ) { }

  col<T>(ref: CollectionPredicate<T>, queryFn?): AngularFirestoreCollection<T> {
    return typeof ref === 'string' ? this.afs.collection<T>(ref, queryFn) : ref
  }

  doc<T>(ref: DocPredicate<T>): AngularFirestoreDocument<T> {
    return typeof ref === 'string' ? this.afs.doc<T>(ref) : ref
  }

  doc$<T>(ref: DocPredicate<T>): Observable<T> {
    return this.doc(ref).snapshotChanges().map(doc => {
      const data: any = doc.payload.data();
      data.id = doc.payload.id;
      return data as T;
    })
  }

  col$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<T[]> {
    return this.col(ref, queryFn).snapshotChanges().map(docs => {
      return docs.map(a => a.payload.doc.data()) as T[]
    });
  }

  colWithIds$<T>(ref: CollectionPredicate<T>, queryFn?): Observable<any[]> {
    return this.col(ref, queryFn).snapshotChanges().map(actions => {
      return actions.map(a => {
        const data: any = a.payload.doc.data();
        const id = a.payload.doc.id;
        return { id, ...data };
      });
    });
  }

  get timestamp() {
    return firebase.firestore.FieldValue.serverTimestamp()
  }

  add<T>(ref: CollectionPredicate<T>, data, snackbarDisplay) {
    const timestamp = this.timestamp
    var snackBar = this.snackBar;
    return this.col(ref).add({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    }).then(function (docRef) {
      snackBar.open(snackbarDisplay + " ajouté avec succès.", "Dismiss", {
        duration: 3000,
      });
      return true;
    }).catch(function (error) {
      return false;
    });

  }

  update<T>(ref: DocPredicate<T>, data: any, snackbarDisplay?) {
    var snackBar = this.snackBar;
    return this.doc(ref).update({
      ...data,
      updatedAt: this.timestamp
    }).then(function () {
      if (snackbarDisplay) {
        snackBar.open(snackbarDisplay + " modifié avec succès.", "Dismiss", {
          duration: 3000,
        });
      }
      return true;
    }).catch(function (error) {
      snackBar.open("Une erreure est survenue lors de la modification, veuilliez réessayer.");
      console.log(error);
      return false;
    })
  }

  set<T>(ref: DocPredicate<T>, data: any, snackbarDisplay?) {
    var snackBar = this.snackBar;
    const timestamp = this.timestamp
    return this.doc(ref).set({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    }).then(function () {
      if (snackbarDisplay) {
        snackBar.open(snackbarDisplay + " modifié avec succès.", "Dismiss", {
          duration: 3000,
        });
      }
      return true;
    }).catch(function (error) {
      snackBar.open("Une erreure est survenue lors de la modification, veuilliez réessayer.");
      console.log(error);
      return false;
    })
  }

  delete<T>(ref: DocPredicate<T>, snackbarDisplay) {
    var snackBar = this.snackBar;
    return this.doc(ref).delete().then(function () {
      snackBar.open(snackbarDisplay + " supprimé avec succès.", "Dismiss", {
        duration: 3000,
      });
      return true;
    }).catch(function (error) {
      return false;
    });
  }

  inspectDoc(ref: DocPredicate<any>): void {
    const tick = new Date().getTime()
    this.doc(ref).snapshotChanges()
      .take(1)
      .do(d => {
        const tock = new Date().getTime() - tick
        console.log(`Loaded Document in ${tock}ms`, d)
      })
      .subscribe()
  }

  inspectCol(ref: CollectionPredicate<any>): void {
    const tick = new Date().getTime()
    this.col(ref).snapshotChanges()
      .take(1)
      .do(c => {
        const tock = new Date().getTime() - tick
        console.log(`Loaded Collection in ${tock}ms`, c)
      })
      .subscribe()
  }

  connect(host: DocPredicate<any>, key: string, doc: DocPredicate<any>) {
    return this.doc(host).update({ [key]: this.doc(doc).ref })
  }

  docWithRefs$<T>(ref: DocPredicate<T>) {
    return this.doc$(ref).map(doc => {
      for (const k of Object.keys(doc)) {
        if (doc[k] instanceof firebase.firestore.DocumentReference) {
          doc[k] = this.doc(doc[k].path)
        }
      }
      return doc
    })
  }

  getCollection(collection: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      firebase.app().firestore().collection(collection).get().then(querySnapshot => {
        let result: any[] = [];
        querySnapshot.forEach(function (doc) {
          const data: any = doc.data();
          data.id = doc.id;
          result.push(data);
        });
        resolve(result);
      }).catch(error => reject(error));
    });
  }


}