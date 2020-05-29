import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

export interface IZone extends IZoneDB {
  id: string;
}

export interface IZoneDB {
  nom: string;
}

@Injectable()
export class ZoneService {

  constructor(
    private afs: AngularFirestore
  ) { }

  public async getZones(): Promise<IZone[]> {
    return (await this.afs.collection<IZone>('zones').ref.orderBy('nom').get()).docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as IZone;
    });
  }

  public async getZone(id: string): Promise<IZone> {
    const data = await this.afs.doc<IZone>(`zones/${id}`).ref.get();
    return {
      id: data.id,
      ...data.data()
    } as IZone;
  }

  public async addZone(zone: IZone): Promise<IZone> {
    const data = await this.afs.collection(`zones`).add(this._saveState(zone));
    return { id: data.id, ...zone } as IZone;
  }

  public async updateZone(zone: IZone): Promise<IZone> {
    await this.afs.doc<IZone>(`zones/${zone.id}`).update(this._saveState(zone));
    return zone;
  }

  public async deleteZone(id: string): Promise<boolean> {
    await this.afs.doc<IZone>(`zones/${id}`).delete();
    return true;
  }

  private _saveState(item: IZone): IZoneDB {
    return {
      nom: item.nom,
    };
  }
}