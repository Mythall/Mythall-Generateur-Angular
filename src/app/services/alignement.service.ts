import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { AngularFirestore } from 'angularfire2/firestore';
import { environment } from '../../environments/environment';
import { Alignement } from '../models/alignement';
import { Observable } from 'rxjs';

@Injectable()
export class AlignementService {

    constructor(
        private http: HttpClient,
        private afs: AngularFirestore
    ) { }

    private url = environment.api + 'alignements/';

    getAlignements$(): Observable<Alignement[]> {
        return this.afs.collection<Alignement>('alignements').snapshotChanges().map(actions => {
            return actions.map(a => {
                const data = a.payload.doc.data() as Alignement;
                data.id = a.payload.doc.id;
                return data;
            });
        });
    }

    getAlignements(): Observable<Alignement[]> {
        return this.http.get(this.url).map((res: Alignement[]) => res);
    }

    getAlignement(id: string): Observable<Alignement> {
        return this.http.get(this.url + id).map((res: Alignement) => res);
    }

    addAlignement(alignement: Alignement): Observable<Alignement> {
        return this.http.post(this.url, alignement.saveState()).map((res: Alignement) => res);
    }

    updateAlignement(alignement: Alignement): Observable<Alignement> {
        return this.http.put(this.url, { id: alignement.id, data: alignement.saveState() }).map((res: Alignement) => res);
    }

    deleteAlignement(id: string): Observable<boolean> {
        return this.http.delete(this.url, { params: new HttpParams().set('id', id) }).map((res: boolean) => res);
    }

}