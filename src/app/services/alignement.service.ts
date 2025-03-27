import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

export interface IAlignement extends IAlignementDB {
  id: string;
}

export interface IAlignementDB {
  nom: string;
}

@Injectable()
export class AlignementService {

  constructor(
    private afs: AngularFirestore
  ) { }

  public async getAlignements(): Promise<IAlignement[]> {
    return (await this.afs.collection<IAlignement>('alignements').ref.get()).docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as IAlignement;
    });
  }

  public async getAlignement(id: string): Promise<IAlignement> {
    const data = await this.afs.doc<IAlignement>(`alignements/${id}`).ref.get();
    return {
      id: data.id,
      ...data.data()
    } as IAlignement;
  }

  public async addAlignement(alignement: IAlignement): Promise<IAlignement> {
    const data = await this.afs.collection(`alignements`).add(this._saveState(alignement));
    return { id: data.id, ...alignement } as IAlignement;
  }

  public async updateAlignement(alignement: IAlignement): Promise<IAlignement> {
    await this.afs.doc<IAlignement>(`alignements/${alignement.id}`).update(this._saveState(alignement));
    return alignement;
  }

  public async deleteAlignement(id: string): Promise<boolean> {
    await this.afs.doc<IAlignement>(`alignements/${id}`).delete();
    return true;
  }

  private _saveState(item: IAlignement): IAlignementDB {
    return {
      nom: item.nom,
    };
  }

}