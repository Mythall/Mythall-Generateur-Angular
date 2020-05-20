import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { EcoleService, IEcole } from './ecole.service';
import { PorteService, IPorte } from './porte.service';
import { DureeService, IDuree } from './duree.service';
import { ZoneService, IZone } from './zone.service';

export interface ISort extends ISortDB {
  id: string;
  ecole: IEcole;
  porte: IPorte;
  duree: IDuree;
  zone: IZone;
}

export interface ISortDB {
  nom: string;
  niveau: string;
  incantation: string;
  sommaire: string;
  description: string;
  ecoleRef: string;
  porteRef: string;
  dureeRef: string;
  zoneRef: string;
}

export class SortItem {
  constructor() {
    this.sort = null;
    this.sortRef = '';
    this.niveauObtention = 1;
  }
  sort: ISort;
  sortRef: string;
  niveauObtention: number;
}

@Injectable()
export class SortService {

  constructor(
    private afs: AngularFirestore,
    private ecoleService: EcoleService,
    private porteService: PorteService,
    private dureeService: DureeService,
    private zoneService: ZoneService
  ) { }

  public async getSorts(): Promise<ISort[]> {
    return (await this.afs.collection<IEcole>('ecoles').ref.orderBy('nom').get()).docs
      .map((doc) => {
        return {
          id: doc.id,
          ...doc.data()
        } as ISort;
      })
      .sort((a: ISort, b: ISort) => {
        return a.nom.localeCompare(b.nom);
      })
  }

  public async getSort(id: string): Promise<ISort> {
    const data = await this.afs.doc<ISort>(`sorts/${id}`).ref.get();
    let sort = {
      id: data.id,
      ...data.data()
    } as ISort;

    sort.ecole = await this.ecoleService.getEcole(sort.ecoleRef);
    sort.porte = await this.porteService.getPorte(sort.porteRef);
    sort.duree = await this.dureeService.getDuree(sort.dureeRef);
    sort.zone = await this.zoneService.getZone(sort.zoneRef);

    return sort;
  }

  public async addSort(sort: ISort): Promise<ISort> {
    const data = await this.afs.collection(`sorts`).add(this._saveState(sort));
    return { id: data.id, ...sort } as ISort;
  }

  public async updateSort(sort: ISort): Promise<ISort> {
    await this.afs.doc<ISort>(`sorts/${sort.id}`).update(this._saveState(sort));
    return sort;
  }

  public async deleteSort(id: string): Promise<boolean> {
    await this.afs.doc<ISort>(`sorts/${id}`).delete();
    return true;
  }

  private _saveState(item: ISort): ISortDB {
    return {
      nom: item.nom,
      niveau: item.niveau,
      incantation: item.incantation,
      sommaire: item.sommaire,
      description: item.description,
      ecoleRef: item.ecoleRef,
      porteRef: item.porteRef,
      dureeRef: item.dureeRef,
      zoneRef: item.zoneRef,
    };
  }

}