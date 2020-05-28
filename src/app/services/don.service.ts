import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ImmuniteService, IImmunite } from './immunite.service';
import { ResistanceService, ResistanceItem } from './resistance.service';
import { StatistiqueService, StatistiqueItem, IStatistique } from './statistique.service';
import { ClasseAuthorise } from './classe.service';
import { IRace } from './race.service';

export interface IDon extends IDonDB {
  id: string;
  modificateurs: IStatistique[];
  donsRequis: IDon[];
  immunites: IImmunite[];
  racesAutorise: IRace[];
}

export interface IDonDB {
  nom: string;
  description: string;
  niveauRequis: number;
  nlsRequis: number;
  niveauMaxObtention: number;
  categorie: string;
  afficherNiveau: boolean;
  modificateursRef: string[];
  classesAutorise: ClasseAuthorise[];
  donsRequisRef: string[];
  immunitesRef: string[];
  racesAutoriseRef: string[];
  resistances: ResistanceItem[];
  statistiques: StatistiqueItem[];
}

export class DonItem {
  constructor() {
    this.don = null;
    this.donRef = '';
    this.niveauObtention = 1;
    this.niveauEffectif = 1;
  }

  don: IDon;
  donRef: string;
  niveauObtention: number;
  niveauEffectif: number;
}

export const DonCategories = ['Normal', 'Connaissance', 'Statistique', 'Résistance', 'Immunité', 'Maniement', 'Épique', 'Metamagie', 'Création', 'Spécialisation Martiale'];

@Injectable()
export class DonService {

  constructor(
    private afs: AngularFirestore,
    private immuniteService: ImmuniteService,
    private resistanceService: ResistanceService,
    private statistiqueService: StatistiqueService
  ) { }

  public async getDons(categorie?: string): Promise<IDon[]> {
    const ref = this.afs.collection<IDon>('dons').ref.orderBy('nom');
    const query = categorie ? ref.where('categorie', '==', categorie).get() : ref.get();
    return (await query).docs
      .map((doc) => {
        return {
          id: doc.id,
          ...doc.data()
        } as IDon;
      })
      .sort((a: IDon, b: IDon) => {
        return a.nom.localeCompare(b.nom);
      })
  }

  public async getDon(id: string, full?: boolean, fiche?: boolean): Promise<IDon> {
    const data = await this.afs.doc<IDon>(`dons/${id}`).ref.get();
    const don = {
      id: data.id,
      ...data.data()
    } as IDon;

    // ...
    // Pas sure encore si full est nécessaire
    if (full) {
      // this.getClassesAuthorise(don, observableBatch);
      // this.getDonsRequis(don, observableBatch);
      // this.getRaces(don, observableBatch);
    }

    if (fiche || full) {
      this._getImmunites(don);
      this._getResistances(don);
      this._getStatistiques(don);
      this._getModificateur(don);
    }

    return don;
  }

  public async addDon(don: IDon): Promise<IDon> {
    const data = await this.afs.collection(`dons`).add(this._saveState(don));
    return { id: data.id, ...don } as IDon;
  }

  public async updateDon(don: IDon): Promise<IDon> {
    await this.afs.doc<IDon>(`dons/${don.id}`).update(this._saveState(don));
    return don;
  }

  public async deleteDon(id: string): Promise<boolean> {
    await this.afs.doc<IDon>(`dons/${id}`).delete();
    return true;
  }

  private _saveState(item: IDon): IDonDB {

    if (!item.afficherNiveau) item.afficherNiveau = false;
    if (!item.classesAutorise) item.classesAutorise = [];
    if (!item.donsRequisRef) item.donsRequisRef = [];
    if (!item.immunitesRef) item.immunitesRef = [];
    if (!item.racesAutoriseRef) item.racesAutoriseRef = [];
    if (!item.resistances) item.resistances = [];
    if (!item.statistiques) item.statistiques = [];
    if (!item.modificateursRef) item.modificateursRef = [];

    //Filter Out
    item.classesAutorise.forEach(classe => {
      classe.classe = null;
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
      niveauRequis: item.niveauRequis,
      nlsRequis: item.nlsRequis,
      niveauMaxObtention: item.niveauMaxObtention,
      categorie: item.categorie,
      afficherNiveau: item.afficherNiveau,
      classesAutorise: item.classesAutorise.map((obj) => { return { ...obj } }),
      donsRequisRef: item.donsRequisRef,
      immunitesRef: item.immunitesRef,
      racesAutoriseRef: item.racesAutoriseRef,
      resistances: item.resistances.map((obj) => { return { ...obj } }),
      statistiques: item.statistiques.map((obj) => { return { ...obj } }),
      modificateursRef: item.modificateursRef
    };
  }

  // ...
  // Pas sure encore si je dois garder c'est 3 methodes la

  // private getClassesAuthorise(don: Don, observableBatch: any[]) {
  //   if (don.classesAutorise && don.classesAutorise.length > 0) {
  //     don.classesAutorise.forEach(classeAuthorise => {
  //       observableBatch.push(this.db.doc$('classes/' + classeAuthorise.classeRef).pipe(
  //         map((classe: Classe) => {
  //           classeAuthorise.classe = classe;
  //         }), first()
  //       ))
  //     });
  //   }
  // }

  // private getDonsRequis(don: Don, observableBatch: any[]) {
  //   if (don.donsRequisRef) {
  //     don.donsRequisRef.forEach(donRequisRef => {
  //       observableBatch.push(this.getDon(donRequisRef).pipe(
  //         map((don: Don) => {
  //           if (!don.donsRequis) don.donsRequis = [];
  //           don.donsRequis.push(don);
  //         }), first()
  //       ))
  //     });
  //   }
  // }

  // private getRaces(don: Don, observableBatch: any[]) {
  //   if (don.racesAutoriseRef) {
  //     don.racesAutoriseRef.forEach(raceRef => {
  //       observableBatch.push(this.db.doc$('races/' + raceRef).pipe(
  //         map((race: Race) => {
  //           if (!don.racesAutorise) don.racesAutorise = [];
  //           don.racesAutorise.push(race);
  //         }),
  //         first()
  //       ))
  //     });
  //   }
  // }

  private _getImmunites(don: IDon): void {
    if (don.immunitesRef) {
      don.immunitesRef.forEach(async (immuniteRef) => {
        if (!don.immunites) don.immunites = [];
        don.immunites.push(await this.immuniteService.getImmunite(immuniteRef));
      });
    }
  }

  private _getResistances(don: IDon): void {
    if (don.resistances && don.resistances.length > 0) {
      don.resistances.forEach(async (resistanceItem: ResistanceItem) => {
        resistanceItem.resistance = await this.resistanceService.getResistance(resistanceItem.resistanceRef);
      });
    }
  }

  private _getStatistiques(don: IDon): void {
    if (don.statistiques && don.statistiques.length > 0) {
      don.statistiques.forEach(async (statistiqueItem: StatistiqueItem) => {
        statistiqueItem.statistique = await this.statistiqueService.getStatistique(statistiqueItem.statistiqueRef);
      });
    }
  }

  private _getModificateur(don: IDon): void {
    if (don.modificateursRef && don.modificateursRef.length > 0) {
      don.modificateursRef.forEach(async (modificateurRef) => {
        if (!don.modificateurs) don.modificateurs = [];
        don.modificateurs.push(await this.statistiqueService.getStatistique(modificateurRef));
      });
    }
  }

}