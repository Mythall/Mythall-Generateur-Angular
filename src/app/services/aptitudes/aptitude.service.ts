import { Injectable } from '@angular/core';
import { FirestoreService } from '../firestore/firestore.service';
import 'firebase/firestore';
import { ImmuniteService } from '../immunite.service';
import { ResistanceService, ResistanceItem } from '../resistance.service';
import { StatistiqueService, StatistiqueItem } from '../statistique.service';
import { Aptitude } from './models/aptitude';
import { Observable, of, forkJoin } from 'rxjs';
import { tap, flatMap, map } from 'rxjs/operators';

@Injectable()
export class AptitudeService {

  constructor(
    private db: FirestoreService,
    private immuniteService: ImmuniteService,
    private resistanceService: ResistanceService,
    private statistiqueService: StatistiqueService,
  ) { }

  getAptitudes(): Observable<Aptitude[]> {
	return this.db.colWithIds$('aptitudes', ref => ref.orderBy("nom")).pipe(
		tap(results => {
			results.sort((a: Aptitude, b: Aptitude) => {
				return a.nom.localeCompare(b.nom);
			})
		})
	);
  }

  getAptitude(id: string): Observable<Aptitude> {
    return this.db.doc$('aptitudes/' + id).pipe(
      flatMap((aptitude: Aptitude) => {

        let observableBatch: Observable<Aptitude>[] = [];
        observableBatch.push(of(aptitude));

        this._getImmunites(aptitude);
        this._getResistances(aptitude);
        this._getStatistiques(aptitude);

        return forkJoin(observableBatch).pipe(
          map((data: any[]) => {
            let aptitude: Aptitude = this.map(data[0]);
            return aptitude;
          })
        )
      })
    ) as Observable<Aptitude>
  }

  addAptitude(aptitude: Aptitude) {
    return this.db.add('aptitudes', aptitude, aptitude.nom);
  }

  updateAptitude(id: string, aptitude: Aptitude) {
    return this.db.update('aptitudes/' + id, aptitude, aptitude.nom);
  }

  deleteAptitude(aptitude: Aptitude) {
    return this.db.delete('aptitudes/' + aptitude.id, aptitude.nom);
  }

  //#region Maps
  map(data: Aptitude): Aptitude {
    var aptitude: Aptitude = new Aptitude();
    for (var key in data) {
      aptitude[key] = data[key]
    }
    return aptitude;
  }

  //#endregion

  //#region Private Methods

  private _getImmunites(aptitude: Aptitude) {
    if (aptitude.immunitesRef) {
      aptitude.immunitesRef.forEach(async (immuniteRef) => {
        if (!aptitude.immunites) aptitude.immunites = [];
        aptitude.immunites.push(await this.immuniteService.getImmunite(immuniteRef));
      });
    }
  }

  private _getResistances(aptitude: Aptitude): void {
    if (aptitude.resistances && aptitude.resistances.length > 0) {
      aptitude.resistances.forEach(async (resistanceItem: ResistanceItem) => {
        resistanceItem.resistance = await this.resistanceService.getResistance(resistanceItem.resistanceRef);
      });
    }
  }  

  
  private _getStatistiques(aptitude: Aptitude) {
    if (aptitude.statistiques && aptitude.statistiques.length > 0) {
      aptitude.statistiques.forEach(async (statistiqueItem: StatistiqueItem) => {
        statistiqueItem.statistique = await this.statistiqueService.getStatistique(statistiqueItem.statistiqueRef);
      });
    }
  }  

  //#endregion

}