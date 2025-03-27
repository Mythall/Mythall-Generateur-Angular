import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AptitudeService, AptitudeItem } from './aptitude.service';
import { DonService, DonItem } from './don.service';
import { SortService, SortItem } from './sort.service';

export interface IEsprit extends IEspritDB {
  id: string;
}

export interface IEspritDB {
  nom: string;
  description: string;
  aptitudes: AptitudeItem[];
  dons: DonItem[];
  sorts: SortItem[];
}

@Injectable()
export class EspritService {

  constructor(
    private afs: AngularFirestore,
    private aptitudeService: AptitudeService,
    private donService: DonService,
    private sortService: SortService
  ) { }

  public async getEsprits(): Promise<IEsprit[]> {
    return (await this.afs.collection<IEsprit>('esprits').ref.orderBy('nom').get()).docs
      .map((doc) => {
        return {
          id: doc.id,
          ...doc.data()
        } as IEsprit;
      });
  }

  public async getEsprit(id: string): Promise<IEsprit> {
    const data = await this.afs.doc<IEsprit>(`esprits/${id}`).ref.get();
    let esprit = {
      id: data.id,
      ...data.data()
    } as IEsprit;

    this._getAptitudees(esprit);
    this._getSorts(esprit);
    this._getDons(esprit);

    return esprit;
  }

  public async addEsprit(esprit: IEsprit): Promise<IEsprit> {
    const data = await this.afs.collection(`esprits`).add(this._saveState(esprit));
    return { id: data.id, ...esprit } as IEsprit;
  }

  public async updateEsprit(esprit: IEsprit): Promise<IEsprit> {
    await this.afs.doc<IEsprit>(`esprits/${esprit.id}`).update(this._saveState(esprit));
    return esprit;
  }

  public async deleteEsprit(id: string): Promise<boolean> {
    await this.afs.doc<IEsprit>(`esprits/${id}`).delete();
    return true;
  }

  private _saveState(item: IEsprit): IEspritDB {
    if (!item.aptitudes) item.aptitudes = [];
    if (!item.dons) item.dons = [];
    if (!item.sorts) item.sorts = [];

    //Filter Out
    item.aptitudes.forEach(aptitude => {
      aptitude.aptitude = null;
    });

    item.dons.forEach(don => {
      don.don = null;
    });

    item.sorts.forEach(sort => {
      sort.sort = null;
    });

    return {
      nom: item.nom,
      description: item.description,
      aptitudes: item.aptitudes.map((obj) => { return { ...obj } }),
      dons: item.dons.map((obj) => { return { ...obj } }),
      sorts: item.sorts.map((obj) => { return { ...obj } }),
    };
  }

  private _getAptitudees(esprit: IEsprit): void {
    if (esprit.aptitudes && esprit.aptitudes.length > 0) {
      esprit.aptitudes.forEach(async (aptitudeItem: AptitudeItem) => {
        aptitudeItem.aptitude = await this.aptitudeService.getAptitude(aptitudeItem.aptitudeRef);
      });
    }
  }

  private _getDons(esprit: IEsprit): void {
    if (esprit.dons && esprit.dons.length > 0) {
      esprit.dons.forEach(async (donItem: DonItem) => {
        donItem.don = await this.donService.getDon(donItem.donRef);
      });
    }
  }

  private _getSorts(esprit: IEsprit): void {
    if (esprit.sorts && esprit.sorts.length > 0) {
      esprit.sorts.forEach(async (sortItem: SortItem) => {
        sortItem.sort = await this.sortService.getSort(sortItem.sortRef);
      });
    }
  }

}