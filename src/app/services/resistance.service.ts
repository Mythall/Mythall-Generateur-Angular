import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

export interface IResistance extends IResistanceDB {
  id: string;
}

export interface IResistanceDB {
  nom: string;
}

export class ResistanceItem {

  constructor() {
    this.resistance = null;
    this.resistanceRef = '';
    this.niveau = 1;
    this.valeur = 0;
    this.cummulable = false;
  }

  resistance: IResistance;
  resistanceRef: string;
  niveau: number;
  valeur: number;
  cummulable: boolean;
}


export class ResistanceValue {

  constructor() {
    this.resistance = null;
    this.valeur = 0;
  }

  resistance: IResistance;
  valeur: number;
}

@Injectable()
export class ResistanceService {

  constructor(
    private afs: AngularFirestore
  ) { }

  public async getResistances(): Promise<IResistance[]> {
    return (await this.afs.collection<IResistance>('resistances').ref.orderBy('nom').get()).docs
      .map((doc) => {
        return {
          id: doc.id,
          ...doc.data()
        } as IResistance;
      });
  }

  public async getResistance(id: string): Promise<IResistance> {
    const data = await this.afs.doc<IResistance>(`resistances/${id}`).ref.get();
    return {
      id: data.id,
      ...data.data()
    } as IResistance;
  }

  public async addResistance(resistance: IResistance): Promise<IResistance> {
    const data = await this.afs.collection(`resistances`).add(this._saveState(resistance));
    return { id: data.id, ...resistance } as IResistance;
  }

  public async updateResistance(resistance: IResistance): Promise<IResistance> {
    await this.afs.doc<IResistance>(`resistances/${resistance.id}`).update(this._saveState(resistance));
    return resistance;
  }

  public async deleteResistance(id: string): Promise<boolean> {
    await this.afs.doc<IResistance>(`resistances/${id}`).delete();
    return true;
  }

  private _saveState(item: IResistance): IResistanceDB {
    return {
      nom: item.nom,
    };
  }

}