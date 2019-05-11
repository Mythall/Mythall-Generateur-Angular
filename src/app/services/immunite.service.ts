import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AngularFirestore } from 'angularfire2/firestore';
import { environment } from '../../environments/environment';
import { Immunite } from '../models/immunite';
import { Observable } from 'rxjs';

@Injectable()
export class ImmuniteService {

  constructor(
    private http: HttpClient,
    private afs: AngularFirestore
  ) { }

  private url = environment.api + 'immunites/';

  getImmunites$(): Observable<Immunite[]> {
    return this.afs.collection<Immunite>('immunites', ref => ref.orderBy("nom")).snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Immunite;
        data.id = a.payload.doc.id;
        return data;
      });
    });
  }

  getImmunites(): Observable<Immunite[]> {
    return this.http.get(this.url).map((res: Immunite[]) => res);
  }

  getImmunite(id: string): Observable<Immunite> {
    return this.http.get(this.url + id).map((res: Immunite) => res);
  }

  addImmunite(immunite: Immunite): Observable<Immunite> {
    return this.http.post(this.url, immunite.saveState()).map((res: Immunite) => res);
  }

  updateImmunite(immunite: Immunite): Observable<Immunite> {
    return this.http.put(this.url, { id: immunite.id, data: immunite.saveState() }).map((res: Immunite) => res);
  }

  deleteImmunite(id: string): Observable<boolean> {
    return this.http.delete(this.url, { params: new HttpParams().set('id', id) }).map((res: boolean) => res);
  }

}