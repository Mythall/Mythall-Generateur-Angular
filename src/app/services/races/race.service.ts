import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { FirestoreService } from '../firestore/firestore.service';
import { ImmuniteService } from '../immunite.service';
import { ResistanceService, ResistanceItem } from '../resistance.service';
import { StatistiqueService, StatistiqueItem } from '../statistique.service';
import { SortService } from '../sort.service';
import { Race } from './models/race';
import { Classe } from '../classes/models/classe';
import { Don } from '../dons/models/don';
import { tap, map, mergeMap, flatMap, first } from 'rxjs/operators';

@Injectable()
export class RaceService {

  constructor(
    private db: FirestoreService,
    private immuniteService: ImmuniteService,
    private resistanceService: ResistanceService,
    private statistiqueService: StatistiqueService,
    private sortService: SortService
  ) { }

  getRaces(): Observable<Race[]> {

    let races: Observable<Race[]> = this.db.colWithIds$('races', ref => ref.orderBy("nom")).pipe(
      tap(results => {
        results.sort((a: Race, b: Race) => {
          return a.nom.localeCompare(b.nom);
        })
      })).pipe(
        mergeMap((races: Race[]) => {

          races.forEach(race => {

            let observableBatch: Observable<any>[] = [];
            observableBatch.push(of(race));

            this.getClasses(race, observableBatch);

            forkJoin(observableBatch).pipe(
              map((data: any[]) => {
                let race: Race = this.map(data[0]);
                return race;
              })
            ).subscribe();

          })

          return of(races);

        })
      )

    return races;

  }

  getRacesSummary(): Observable<Race[]> {
    return this.db.colWithIds$('races', ref => ref.orderBy("nom"));
  }

  getRace(id: string): Observable<Race> {
    return this.db.doc$('races/' + id).pipe(
      flatMap((race: Race) => {

        let observableBatch: Observable<any>[] = [];
        observableBatch.push(of(race));

        this.getClasses(race, observableBatch);
        this._getResistances(race);
        this._getStatistiques(race);
        this._getImmunites(race);
        this.getDonsRaciaux(race, observableBatch);

        return forkJoin(observableBatch).pipe(
          map((data: any[]) => {
            let race: Race = this.map(data[0]);
            this._getSortsRaciaux(race);
            return race;
          })
        )

      })
    )
  }

  getRaceSummary(id: string): Observable<Race> {
    return this.db.doc$('races/' + id);
  }

  addRace(race: Race) {
    return this.db.add('races', race, race.nom);
  }

  updateRace(id: string, race: Race) {
    return this.db.update('races/' + id, race, race.nom);
  }

  deleteRace(race: Race) {
    return this.db.delete('races/' + race.id, race.nom);
  }

  map(data: Race): Race {
    var race: Race = new Race();
    for (var key in data) {
      race[key] = data[key]
    }
    return race;
  }

  //#region Fetch Data

  private getClasses(race: Race, observableBatch: any[]) {
    if (race.classesDisponibleRef) {
      race.classesDisponibleRef.forEach(classeRef => {
        observableBatch.push(this.db.doc$('classes/' + classeRef).pipe(
          map((classe: Classe) => {
            if (!race.classesDisponible) race.classesDisponible = [];
            race.classesDisponible.push(classe);
          }),
          first()
        ))
      });
    }
  }

  private _getResistances(race: Race) {
    if (race.resistances && race.resistances.length > 0) {
      race.resistances.forEach(async (resistanceItem: ResistanceItem) => {
        resistanceItem.resistance = await this.resistanceService.getResistance(resistanceItem.resistanceRef);
      });
    }
  }

  private _getStatistiques(race: Race) {
    if (race.statistiques && race.statistiques.length > 0) {
      race.statistiques.forEach(async (statistiqueItem: StatistiqueItem) => {
        statistiqueItem.statistique = await this.statistiqueService.getStatistique(statistiqueItem.statistiqueRef);
      });
    }
  }

  private _getImmunites(race: Race) {
    if (race.immunitesRef) {
      race.immunitesRef.forEach(async (immuniteRef) => {
        if (!race.immunites) race.immunites = [];
        race.immunites.push(await this.immuniteService.getImmunite(immuniteRef));
      });
    }
  }

  private async _getSortsRaciaux(race: Race): Promise<void> {
    if (race.sortsRacialRef) {
      race.sortsRacialRef.forEach(async (sortRaciauxRef) => {
        if (!race.sortsRacial) race.sortsRacial = [];
        race.sortsRacial.push(await this.sortService.getSort(sortRaciauxRef));
      });
    }
  }

  private getDonsRaciaux(race: Race, observableBatch: any[]) {
    if (race.donsRacialRef) {
      race.donsRacialRef.forEach(donRaciauxRef => {
        observableBatch.push(this.db.doc$('dons/' + donRaciauxRef).pipe(
          map((don: Don) => {
            if (!race.donsRacial) race.donsRacial = [];
            race.donsRacial.push(don);
          }),
          first()
        ))
      });
    }
  }

  //#endregion

}