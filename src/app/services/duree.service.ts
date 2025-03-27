import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

export interface IDuree extends IDureeDB {
  id: string;
}

export interface IDureeDB {
  nom: string;
}

@Injectable()
export class DureeService {

  constructor(
    private afs: AngularFirestore
  ) { }

  public async getDurees(): Promise<IDuree[]> {
    return (await this.afs.collection<IDuree>('durees').ref.get()).docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as IDuree;
    });
  }

  public async getDuree(id: string): Promise<IDuree> {
    const data = await this.afs.doc<IDuree>(`durees/${id}`).ref.get();
    return {
      id: data.id,
      ...data.data()
    } as IDuree;
  }

  public async addDuree(duree: IDuree): Promise<IDuree> {
    const data = await this.afs.collection(`durees`).add(this._saveState(duree));
    return { id: data.id, ...duree } as IDuree;
  }

  public async updateDuree(duree: IDuree): Promise<IDuree> {
    await this.afs.doc<IDuree>(`durees/${duree.id}`).update(this._saveState(duree));
    return duree;
  }

  public async deleteDuree(id: string): Promise<boolean> {
    await this.afs.doc<IDuree>(`durees/${id}`).delete();
    return true;
  }

  private _saveState(item: IDuree): IDureeDB {
    return {
      nom: item.nom,
    };
  }

}