import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

export interface IImmunite extends IImmuniteDB {
  id: string;
}

export interface IImmuniteDB {
  nom: string;
}

@Injectable()
export class ImmuniteService {

  constructor(
    private afs: AngularFirestore
  ) { }

  public async getImmunites(): Promise<IImmunite[]> {
    return (await this.afs.collection<IImmunite>('immunites').ref.orderBy('nom').get()).docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as IImmunite;
    });
  }

  public async getImmunite(id: string): Promise<IImmunite> {
    const data = await this.afs.doc<IImmunite>(`immunites/${id}`).ref.get();
    return {
      id: data.id,
      ...data.data()
    } as IImmunite;
  }

  public async addImmunite(immunite: IImmunite): Promise<IImmunite> {
    const data = await this.afs.collection(`immunites`).add(this._saveState(immunite));
    return { id: data.id, ...immunite } as IImmunite;
  }

  public async updateImmunite(immunite: IImmunite): Promise<IImmunite> {
    await this.afs.doc<IImmunite>(`immunites/${immunite.id}`).update(this._saveState(immunite));
    return immunite;
  }

  public async deleteImmunite(id: string): Promise<boolean> {
    await this.afs.doc<IImmunite>(`immunites/${id}`).delete();
    return true;
  }

  private _saveState(item: IImmunite): IImmuniteDB {
    return {
      nom: item.nom,
    };
  }

}