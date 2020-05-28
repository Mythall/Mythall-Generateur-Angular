import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ImmuniteService, IImmunite } from './immunite.service';
import { ResistanceService, ResistanceItem } from './resistance.service';
import { StatistiqueService, StatistiqueItem } from './statistique.service';
import { Choix } from './personnages/models/choix';
import { IDon } from './don.service';

export interface IAptitude extends IAptitudeDB {
  id: string;
  donsEquivalent: IDon[];
  sortsEquivalent: IDon[];
  immunites: IImmunite[];
}

export interface IAptitudeDB {
  nom: string;
  description: string;
  donsEquivalentRef: string[];
  sortsEquivalentRef: string[];
  immunitesRef: string[];
  resistances: ResistanceItem[];
  statistiques: StatistiqueItem[];
  choix: Choix[];
}

export class AptitudeItem {
  constructor() {
      this.aptitude = null;
      this.aptitudeRef = '';
      this.niveauObtention = 1;
  }

  aptitude: IAptitude;
  aptitudeRef: string;
  niveauObtention: number;
}

@Injectable()
export class AptitudeService {

  constructor(
    private afs: AngularFirestore,
    private immuniteService: ImmuniteService,
    private resistanceService: ResistanceService,
    private statistiqueService: StatistiqueService,
  ) { }

  public async getAptitudes(): Promise<IAptitude[]> {
    return (await this.afs.collection<IAptitude>('aptitudes').ref.orderBy('nom').get()).docs
      .map((doc) => {
        return {
          id: doc.id,
          ...doc.data()
        } as IAptitude;
      })
      .sort((a: IAptitude, b: IAptitude) => {
        return a.nom.localeCompare(b.nom);
      })
  }

  public async getAptitude(id: string): Promise<IAptitude> {
    const data = await this.afs.doc<IAptitude>(`aptitudes/${id}`).ref.get();
    let aptitude = {
      id: data.id,
      ...data.data()
    } as IAptitude;

    this._getImmunites(aptitude);
    this._getResistances(aptitude);
    this._getStatistiques(aptitude);

    return aptitude;
  }

  public async addAptitude(aptitude: IAptitude): Promise<IAptitude> {
    const data = await this.afs.collection(`aptitudes`).add(this._saveState(aptitude));
    return { id: data.id, ...aptitude } as IAptitude;
  }

  public async updateAptitude(aptitude: IAptitude): Promise<IAptitude> {
    await this.afs.doc<IAptitude>(`aptitudes/${aptitude.id}`).update(this._saveState(aptitude));
    return aptitude;
  }

  public async deleteAptitude(id: string): Promise<boolean> {
    await this.afs.doc<IAptitude>(`aptitudes/${id}`).delete();
    return true;
  }

  private _saveState(item: IAptitude): IAptitudeDB {

    if (!item.donsEquivalentRef) item.donsEquivalentRef = [];
    if (!item.sortsEquivalentRef) item.sortsEquivalentRef = [];
    if (!item.immunitesRef) item.immunitesRef = [];
    if (!item.resistances) item.resistances = [];
    if (!item.statistiques) item.statistiques = [];
    if (!item.choix) item.choix = [];

    //Filter Out
    item.resistances.forEach(resistance => {
      resistance.resistance = null;
    });
    item.statistiques.forEach(statistique => {
      statistique.statistique = null;
    });

    return {
      nom: item.nom,
      description: item.description,
      donsEquivalentRef: item.donsEquivalentRef,
      sortsEquivalentRef: item.sortsEquivalentRef,
      immunitesRef: item.immunitesRef,
      resistances: item.resistances.map((obj) => { return { ...obj } }),
      statistiques: item.statistiques.map((obj) => { return { ...obj } }),
      choix: item.choix.map((obj) => { return { ...obj } }),
    };
  }

  private _getImmunites(aptitude: IAptitude) {
    if (aptitude.immunitesRef) {
      aptitude.immunitesRef.forEach(async (immuniteRef) => {
        if (!aptitude.immunites) aptitude.immunites = [];
        aptitude.immunites.push(await this.immuniteService.getImmunite(immuniteRef));
      });
    }
  }

  private _getResistances(aptitude: IAptitude): void {
    if (aptitude.resistances && aptitude.resistances.length > 0) {
      aptitude.resistances.forEach(async (resistanceItem: ResistanceItem) => {
        resistanceItem.resistance = await this.resistanceService.getResistance(resistanceItem.resistanceRef);
      });
    }
  }


  private _getStatistiques(aptitude: IAptitude) {
    if (aptitude.statistiques && aptitude.statistiques.length > 0) {
      aptitude.statistiques.forEach(async (statistiqueItem: StatistiqueItem) => {
        statistiqueItem.statistique = await this.statistiqueService.getStatistique(statistiqueItem.statistiqueRef);
      });
    }
  }
}