import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

export interface IPorte extends IPorteDB {
  id: string;
}

export interface IPorteDB {
  nom: string;
}

@Injectable()
export class PorteService {

  constructor(
    private afs: AngularFirestore
  ) { }

  public async getPortes(): Promise<IPorte[]> {
    return (await this.afs.collection<IPorte>('portes').ref.orderBy('nom').get()).docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as IPorte;
    });
  }

  public async getPorte(id: string): Promise<IPorte> {
    const data = await this.afs.doc<IPorte>(`portes/${id}`).ref.get();
    return {
      id: data.id,
      ...data.data()
    } as IPorte;
  }

  public async addPorte(porte: IPorte): Promise<IPorte> {
    const data = await this.afs.collection(`portes`).add(this._saveState(porte));
    return { id: data.id, ...porte } as IPorte;
  }

  public async updatePorte(porte: IPorte): Promise<IPorte> {
    await this.afs.doc<IPorte>(`portes/${porte.id}`).update(this._saveState(porte));
    return porte;
  }

  public async deletePorte(id: string): Promise<boolean> {
    await this.afs.doc<IPorte>(`portes/${id}`).delete();
    return true;
  }

  private _saveState(item: IPorte): IPorteDB {
    return {
      nom: item.nom,
    };
  }
}