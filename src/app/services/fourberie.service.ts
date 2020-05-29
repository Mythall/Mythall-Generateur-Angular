import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { StatistiqueService, IStatistique } from './statistique.service';
import { IDon } from './don.service';

export interface IFourberie extends IFourberieDB {
  id: string;
  modificateur: IStatistique;
  fourberiesRequis: IFourberie[];
  donsEquivalent: IDon[];
}

export interface IFourberieDB {
  nom: string;
  description: string;
  afficherNiveau: boolean;
  modificateurRef: string;
  fourberiesRequisRef: string[];
  donsEquivalentRef: string[];
}

export class FourberieItem {
  constructor() {
    this.fourberie = null;
    this.fourberieRef = '';
    this.niveauObtention = 1;
    this.niveauEffectif = 1;
  }

  fourberie: IFourberie;
  fourberieRef: string;
  niveauObtention: number;
  niveauEffectif: number;
}

@Injectable()
export class FourberieService {

  constructor(
    private afs: AngularFirestore,
    private statistiqueService: StatistiqueService,
  ) { }

  public async getFourberies(): Promise<IFourberie[]> {
    return (await this.afs.collection<IFourberie>('fourberies').ref.orderBy('nom').get()).docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as IFourberie;
    });
  }

  public async getFourberie(id: string): Promise<IFourberie> {
    const data = await this.afs.doc<IFourberie>(`fourberies/${id}`).ref.get();
    const fourberie = {
      id: data.id,
      ...data.data()
    } as IFourberie;
    this._getFourberiesRequis(fourberie);
    this._getModificateur(fourberie);
    return fourberie;
  }

  public async addFourberie(fourberie: IFourberie): Promise<IFourberie> {
    const data = await this.afs.collection(`fourberies`).add(this._saveState(fourberie));
    return { id: data.id, ...fourberie } as IFourberie;
  }

  public async updateFourberie(fourberie: IFourberie): Promise<IFourberie> {
    await this.afs.doc<IFourberie>(`fourberies/${fourberie.id}`).update(this._saveState(fourberie));
    return fourberie;
  }

  public async deleteFourberie(id: string): Promise<boolean> {
    await this.afs.doc<IFourberie>(`fourberies/${id}`).delete();
    return true;
  }

  private _saveState(fourberie: IFourberie): IFourberieDB {

    const result = {
      nom: fourberie.nom,
      description: fourberie.description,
      afficherNiveau: fourberie.afficherNiveau,
      fourberiesRequisRef: fourberie.fourberiesRequisRef,
      donsEquivalentRef: fourberie.donsEquivalentRef,
    } as IFourberieDB;

    if (!result.afficherNiveau) result.afficherNiveau = false;
    if (!result.fourberiesRequisRef) result.fourberiesRequisRef = [];
    if (!result.donsEquivalentRef) result.donsEquivalentRef = [];

    if (fourberie.modificateurRef) {
      result.modificateurRef = fourberie.modificateurRef;
    }

    return result;
  }

  private async _getFourberiesRequis(fourberie: IFourberie): Promise<void> {
    if (fourberie.fourberiesRequisRef) {
      fourberie.fourberiesRequisRef.forEach(async (fourberieRequisRef) => {
        const fourberieRequis = await this.getFourberie(fourberieRequisRef);
        if (!fourberie.fourberiesRequis) fourberie.fourberiesRequis = [];
        fourberie.fourberiesRequis.push(fourberieRequis);
      });
    }
  }

  private async _getModificateur(fourberie: IFourberie): Promise<void> {
    if (fourberie.modificateurRef) {
      fourberie.modificateur = await this.statistiqueService.getStatistique(fourberie.modificateurRef);
    }
  }

}