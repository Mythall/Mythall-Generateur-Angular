import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

export interface IStatistique extends IStatistiqueDB {
  id: string;
}

export interface IStatistiqueDB {
  nom: string;
}

export class StatistiqueItem {

  constructor() {
    this.statistique = null;
    this.statistiqueRef = '';
    this.niveau = 1;
    this.valeur = 0;
    this.cummulable = false;
  }

  statistique: IStatistique;
  statistiqueRef: string;
  niveau: number;
  valeur: number;
  cummulable: boolean;
}


export class StatistiqueValue {

  constructor() {
    this.statistique = null;
    this.valeur = 0;
  }

  statistique: IStatistique;
  valeur: number;
}

export enum StatistiqueIds {
  Constitution = 'OdzM6YHkYw41HXMIcTsw',
  Dextérité = 'oFeJq3NgdDDEwi0Y1rdR',
  Force = 'gOg0TFSbU8mvlv8baCXE',
  Intelligence = 'yKfNuFBQY5UknrTNOxpA',
  Sagesse = 'HkaChqWpHOlINdla02ja',
  PVTorse = 'sCcNIQDoWKUIIcSpkB2m',
  PVBras = 'ZSnV9s6cyzYihdFR6wfr',
  PVJambes = '69jKTq64XUCk51EmY0Z1',
  Lutte = 'Rp8BG8OtlNKl8aeuojdi',
  Mana = '3f75skgSz3CWqdERXcqG',
  Ki = 'py44fmGyDCUnkkBZmto9'
}

@Injectable()
export class StatistiqueService {

  constructor(
    private afs: AngularFirestore
  ) { }

  public async getStatistiques(): Promise<IStatistique[]> {
    return (await this.afs.collection<IStatistique>('statistiques').ref.orderBy('nom').get()).docs
      .map((doc) => {
        return {
          id: doc.id,
          ...doc.data()
        } as IStatistique;
      });
  }

  public async getStatistique(id: string): Promise<IStatistique> {
    const data = await this.afs.doc<IStatistique>(`statistiques/${id}`).ref.get();
    return {
      id: data.id,
      ...data.data()
    } as IStatistique;
  }

  public async addStatistique(statistique: IStatistique): Promise<IStatistique> {
    const data = await this.afs.collection(`statistiques`).add(this._saveState(statistique));
    return { id: data.id, ...statistique } as IStatistique;
  }

  public async updateStatistique(statistique: IStatistique): Promise<IStatistique> {
    await this.afs.doc<IStatistique>(`statistiques/${statistique.id}`).update(this._saveState(statistique));
    return statistique;
  }

  public async deleteStatistique(id: string): Promise<boolean> {
    await this.afs.doc<IStatistique>(`statistiques/${id}`).delete();
    return true;
  }

  private _saveState(item: IStatistique): IStatistiqueDB {
    return {
      nom: item.nom,
    };
  }

}