import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { FirestoreService } from '../firestore/firestore.service';
import { ImmuniteService } from '../immunite.service';
import { ResistanceService, ResistanceItem } from '../resistance.service';
import { StatistiqueService, StatistiqueItem } from '../statistique.service';
import { Classe } from '../classes/models/classe';
import { Don } from './models/don';
import { Race } from '../races/models/race';
import { tap, map, flatMap, first } from 'rxjs/operators';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

@Injectable()
export class DonService {

  constructor(
    private db: FirestoreService,
    private immuniteService: ImmuniteService,
    private resistanceService: ResistanceService,
    private statistiqueService: StatistiqueService
  ) { }

  getDons(): Observable<Don[]> {
    return this.db.colWithIds$('dons', ref => ref.orderBy("nom")).pipe(
      tap(results => {
        results.sort((a: Don, b: Don) => {
          return a.nom.localeCompare(b.nom);
        })
      })
    );
  }

  getDon(id: string): Observable<Don> {
    return this.db.doc$('dons/' + id).pipe(
      flatMap((don: Don) => {

        let observableBatch: Observable<any>[] = [];
        observableBatch.push(of(don));

        this.getClassesAuthorise(don, observableBatch);
        this.getDonsRequis(don, observableBatch);
        this._getImmunites(don);
        this.getRaces(don, observableBatch);
        this._getResistances(don);
        this._getStatistiques(don);
        this._getModificateur(don);

        return forkJoin(observableBatch).pipe(
          map((data: any[]) => {
            let don: Don = this.map(data[0]);
            return don;
          })
        )

      })
    ) as Observable<Don>
  }

  addDon(don: Don) {
    return this.db.add('dons', don, don.nom);
  }

  updateDon(id: string, don: Don) {
    return this.db.update('dons/' + id, don, don.nom);
  }

  deleteDon(don: Don) {
    return this.db.delete('dons/' + don.id, don.nom);
  }

  getDonSummary(id: string): Observable<Don> {
    return this.db.doc$('dons/' + id);
  }

  getDonsByCategorie(type: string): Promise<Don[]> {
    return new Promise((resolve, reject) => {
      firebase.app().firestore().collection('dons').where('categorie', '==', type).get().then(querySnapshot => {
        let result: any[] = [];
        querySnapshot.forEach(function (doc) {
          const data: any = doc.data();
          data.id = doc.id;
          result.push(data);
        });
        resolve(result);
      }).catch(error => reject(error));
    });
  }

  getDonFiche(id: string): Observable<Don> {
    return this.db.doc$('dons/' + id).pipe(
      flatMap((don: Don) => {

        let observableBatch: Observable<any>[] = [];
        observableBatch.push(of(don));

        this._getImmunites(don);
        this._getResistances(don);
        this._getStatistiques(don);
        this._getModificateur(don);

        return forkJoin(observableBatch).pipe(
          map((data: any[]) => {
            let don: Don = this.map(data[0]);
            return don;
          })
        )

      })
    ) as Observable<Don>
  }

  //#region Maps
  map(data: Don): Don {
    var don: Don = new Don();
    for (var key in data) {
      don[key] = data[key]
    }
    return don;
  }

  //#endregion

  //#region Private Methods
  private getClassesAuthorise(don: Don, observableBatch: any[]) {
    if (don.classesAutorise && don.classesAutorise.length > 0) {
      don.classesAutorise.forEach(classeAuthorise => {
        observableBatch.push(this.db.doc$('classes/' + classeAuthorise.classeRef).pipe(
          map((classe: Classe) => {
            classeAuthorise.classe = classe;
          }), first()
        ))
      });
    }
  }

  private getDonsRequis(don: Don, observableBatch: any[]) {
    if (don.donsRequisRef) {
      don.donsRequisRef.forEach(donRequisRef => {
        observableBatch.push(this.getDon(donRequisRef).pipe(
          map((don: Don) => {
            if (!don.donsRequis) don.donsRequis = [];
            don.donsRequis.push(don);
          }), first()
        ))
      });
    }
  }

  private _getImmunites(don: Don) {
    if (don.immunitesRef) {
      don.immunitesRef.forEach(async (immuniteRef) => {
        if (!don.immunites) don.immunites = [];
        don.immunites.push(await this.immuniteService.getImmunite(immuniteRef));
      });
    }
  }

  private getRaces(don: Don, observableBatch: any[]) {
    if (don.racesAutoriseRef) {
      don.racesAutoriseRef.forEach(raceRef => {
        observableBatch.push(this.db.doc$('races/' + raceRef).pipe(
          map((race: Race) => {
            if (!don.racesAutorise) don.racesAutorise = [];
            don.racesAutorise.push(race);
          }),
          first()
        ))
      });
    }
  }

  private _getResistances(don: Don): void {
    if (don.resistances && don.resistances.length > 0) {
      don.resistances.forEach(async (resistanceItem: ResistanceItem) => {
        resistanceItem.resistance = await this.resistanceService.getResistance(resistanceItem.resistanceRef);
      });
    }
  }

  private _getStatistiques(don: Don) {
    if (don.statistiques && don.statistiques.length > 0) {
      don.statistiques.forEach(async (statistiqueItem: StatistiqueItem) => {
        statistiqueItem.statistique = await this.statistiqueService.getStatistique(statistiqueItem.statistiqueRef);
      });
    }
  }

  private _getModificateur(don: Don): void {
    if (don.modificateursRef && don.modificateursRef.length > 0) {
      don.modificateursRef.forEach(async (modificateurRef) => {
        if (!don.modificateurs) don.modificateurs = [];
        don.modificateurs.push(await this.statistiqueService.getStatistique(modificateurRef));
      });
    }
  }

  //#endregion

}