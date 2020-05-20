import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { IAlignement } from "../services/alignement.service";
import { Domaine } from "../services/domaines/models/domaine";

export interface IDieu extends IDieuDB {
  id: string;
  alignement: IAlignement;
  alignementPermis: IAlignement[];
  domaines: Domaine[];
}

export interface IDieuDB {
  nom: string;
  prononciation: string;
  titre: string;
  rang: string;
  alignementRef: string;
  alignementPermisRef: string[];
  domainesRef: string[];
  armeDePredilection: string;
  relations: string;
  dogmes: string;
}

@Injectable()
export class DieuService {

  constructor(
    private afs: AngularFirestore
  ) { }

  public async getDieux(): Promise<IDieu[]> {
    return (await this.afs.collection<IDieu>('dieux').ref.get()).docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as IDieu;
    });
  }

  public async getDieu(id: string): Promise<IDieu> {
    const data = await this.afs.doc<IDieu>(`dieux/${id}`).ref.get();
    return {
      id: data.id,
      ...data.data()
    } as IDieu;
  }

  public async addDieu(dieu: IDieu): Promise<IDieu> {
    const data = await this.afs.collection(`dieux`).add(this._saveState(dieu));
    return { id: data.id, ...dieu } as IDieu;
  }

  public async updateDieu(dieu: IDieu): Promise<IDieu> {
    await this.afs.doc<IDieu>(`dieux/${dieu.id}`).update(this._saveState(dieu));
    return dieu;
  }

  public async deleteDieu(id: string): Promise<boolean> {
    await this.afs.doc<IDieu>(`dieux/${id}`).delete();
    return true;
  }

  private _saveState(item: IDieu): IDieuDB {
    return {
      nom: item.nom,
      prononciation: item.prononciation,
      titre: item.titre,
      rang: item.rang,
      alignementRef: item.alignementRef,
      alignementPermisRef: item.alignementPermisRef,
      domainesRef: item.domainesRef,
      armeDePredilection: item.armeDePredilection,
      relations: item.relations,
      dogmes: item.dogmes,
    };
  }

}