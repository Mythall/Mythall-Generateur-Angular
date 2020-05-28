import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AptitudeService, AptitudeItem } from './aptitude.service';
import { SortService, SortItem } from './sort.service';
import { ImmuniteService, IImmunite } from './immunite.service';
import { ResistanceService, ResistanceItem } from './resistance.service';
import { StatistiqueService, StatistiqueItem } from './statistique.service';
import { DonItem } from './don.service';
import { IAlignement } from './alignement.service';
import { Choix } from './personnage.service';

export interface IClasse extends IClasseDB {
  id: string;
  alignementPermis: IAlignement[];
  multiclassement: IClasse[];
  immunites: IImmunite[];
}

export interface IClasseDB {
  nom: string;
  description: string;
  obligations: string;
  avantages: string;
  desavantages: string;
  alignementPermisRef: string[];
  multiclassementRef: string[];
  aptitudes: AptitudeItem[];
  dons: DonItem[];
  sorts: SortItem[];
  sortsDisponible: SortItem[];
  choix: Choix[];
  statistiques: StatistiqueItem[];
  resistances: ResistanceItem[];
  immunitesRef: string[];
  type: string;
  sort: string;
  prestige: boolean;
}

export const ClasseTypes = ['Combatant', 'Lanceur de Sort'];
export const ClasseSort = ['Divin', 'Profane'];

export class ClasseItem {
  constructor() {
    this.classe = null;
    this.classeRef = '';
    this.niveau = 1;
  }

  classe: IClasse;
  classeRef: string;
  niveau: number;
}

export class ClasseAuthorise {
  constructor() {
    this.classe = null;
    this.classeRef = '';
    this.niveau = 1;
  }

  classe: IClasse;
  classeRef: string;
  niveau: number;
}

@Injectable()
export class ClasseService {
  donService: any;

  constructor(
    private afs: AngularFirestore,
    private aptitudeService: AptitudeService,
    private sortService: SortService,
    private immuniteService: ImmuniteService,
    private resistanceService: ResistanceService,
    private statistiqueService: StatistiqueService,
  ) { }

  public async getClasses(onlyBase?: boolean, onlyPrestige?: boolean): Promise<IClasse[]> {
    let query = this.afs.collection<IClasse>('classes').ref.orderBy('nom');

    if (onlyBase) {
      query = query.where('prestige', '==', false);
    }

    if (onlyPrestige) {
      query = query.where('prestige', '==', true);
    }

    return (await query.get()).docs
      .map((doc) => {
        return {
          id: doc.id,
          ...doc.data()
        } as IClasse;
      })
      .sort((a: IClasse, b: IClasse) => {
        return a.nom.localeCompare(b.nom);
      })
  }

  public async getClasse(id: string, full?: boolean): Promise<IClasse> {
    const data = await this.afs.doc<IClasse>(`classes/${id}`).ref.get();
    let classe = {
      id: data.id,
      ...data.data()
    } as IClasse;

    if (full) {
      this._getMulticlassement(classe);
      this._getAptitudees(classe);
      this._getSorts(classe);
      this._getDons(classe);
      this._getResistances(classe);
      this._getStatistiques(classe);
      this._getImmunites(classe);
    }

    return classe;
  }

  public async addClasse(classe: IClasse): Promise<IClasse> {
    const data = await this.afs.collection(`classes`).add(this._saveState(classe));
    return { id: data.id, ...classe } as IClasse;
  }

  public async updateClasse(classe: IClasse): Promise<IClasse> {
    await this.afs.doc<IClasse>(`classes/${classe.id}`).update(this._saveState(classe));
    return classe;
  }

  public async deleteClasse(id: string): Promise<boolean> {
    await this.afs.doc<IClasse>(`classes/${id}`).delete();
    return true;
  }

  private _saveState(item: IClasse): IClasseDB {
    if (!item.aptitudes) item.aptitudes = [];
    if (!item.dons) item.dons = [];
    if (!item.sorts) item.sorts = [];
    if (!item.sortsDisponible) item.sortsDisponible = [];
    if (!item.choix) item.choix = [];
    if (!item.resistances) item.resistances = [];
    if (!item.statistiques) item.statistiques = [];
    if (!item.immunitesRef) item.immunitesRef = [];
    if (!item.prestige) item.prestige = false;

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

    item.sortsDisponible.forEach(sort => {
      sort.sort = null;
    });

    item.resistances.forEach(resistance => {
      resistance.resistance = null;
    });
    item.statistiques.forEach(statistique => {
      statistique.statistique = null;
    });

    return {
      nom: item.nom,
      description: item.description,
      obligations: item.obligations,
      avantages: item.avantages,
      desavantages: item.desavantages,
      alignementPermisRef: item.alignementPermisRef,
      multiclassementRef: item.multiclassementRef,
      aptitudes: item.aptitudes.map((obj) => { return { ...obj } }),
      dons: item.dons.map((obj) => { return { ...obj } }),
      sorts: item.sorts.map((obj) => { return { ...obj } }),
      sortsDisponible: item.sortsDisponible.map((obj) => { return { ...obj } }),
      choix: item.choix.map((obj) => { return { ...obj } }),
      statistiques: item.statistiques.map((obj) => { return { ...obj } }),
      resistances: item.resistances.map((obj) => { return { ...obj } }),
      immunitesRef: item.immunitesRef,
      type: item.type,
      sort: item.sort,
      prestige: item.prestige
    };
  }

  //#region Private Methods

  private _getMulticlassement(classe: IClasse): void {
    if (classe.multiclassementRef) {
      classe.multiclassementRef.forEach(async (classeRef) => {
        const classe = await this.getClasse(classeRef);
        if (!classe.multiclassement) classe.multiclassement = [];
        classe.multiclassement.push(classe);
      });
    }
  }

  private _getAptitudees(classe: IClasse): void {
    if (classe.aptitudes && classe.aptitudes.length > 0) {
      classe.aptitudes.forEach(async (aptitudeItem: AptitudeItem) => {
        aptitudeItem.aptitude = await this.aptitudeService.getAptitude(aptitudeItem.aptitudeRef);
      });
    }
  }

  private _getDons(classe: IClasse): void {
    if (classe.dons && classe.dons.length > 0) {
      classe.dons.forEach(async (donItem: DonItem) => {
        donItem.don = await this.donService.getDon(donItem.donRef);
      });
    }
  }

  private _getSorts(classe: IClasse): void {
    if (classe.sorts && classe.sorts.length > 0) {
      classe.sorts.forEach(async (sortItem: SortItem) => {
        sortItem.sort = await this.sortService.getSort(sortItem.sortRef);
      });
    }
  }

  private _getResistances(classe: IClasse): void {
    if (classe.resistances && classe.resistances.length > 0) {
      classe.resistances.forEach(async (resistanceItem: ResistanceItem) => {
        resistanceItem.resistance = await this.resistanceService.getResistance(resistanceItem.resistanceRef);
      });
    }
  }

  private _getStatistiques(classe: IClasse): void {
    if (classe.statistiques && classe.statistiques.length > 0) {
      classe.statistiques.forEach(async (statistiqueItem: StatistiqueItem) => {
        statistiqueItem.statistique = await this.statistiqueService.getStatistique(statistiqueItem.statistiqueRef);
      });
    }
  }

  private _getImmunites(classe: IClasse): void {
    if (classe.immunitesRef) {
      classe.immunitesRef.forEach(async (immuniteRef) => {
        if (!classe.immunites) classe.immunites = [];
        classe.immunites.push(await this.immuniteService.getImmunite(immuniteRef));
      });
    }
  }

}