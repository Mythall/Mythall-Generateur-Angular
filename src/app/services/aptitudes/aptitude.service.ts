import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirestoreService } from '../firestore/firestore.service';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

import { ImmuniteService } from '../immunite.service';
import { ResistanceService } from '../resistance.service';
import { StatistiqueService } from '../statistique.service';

import { Aptitude } from './models/aptitude';
import { Immunite } from '../../models/immunite';
import { Resistance, ResistanceItem } from '../../models/resistance';
import { Statistique } from '../../models/statistique';
import { tap } from 'rxjs/operators';

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
    return this.db.doc$('aptitudes/' + id).flatMap((aptitude: Aptitude) => {

      let observableBatch: Observable<any>[] = [];
      observableBatch.push(Observable.of(aptitude));

      this.getImmunites(aptitude, observableBatch);
      this.getResistances(aptitude, observableBatch);
      this.getStatistiques(aptitude, observableBatch);

      return Observable.forkJoin(observableBatch).map((data: any[]) => {
        let aptitude: Aptitude = this.map(data[0]);
        return aptitude;
      })

    })
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

  private getImmunites(aptitude: Aptitude, observableBatch: any[]) {
    if (aptitude.immunitesRef) {
      aptitude.immunitesRef.forEach(immuniteRef => {
        observableBatch.push(this.immuniteService.getImmunite(immuniteRef).map((immunite: Immunite) => {
          if (!aptitude.immunites) aptitude.immunites = [];
          aptitude.immunites.push(immunite);
        }).first())
      });
    }
  }

  private getResistances(aptitude: Aptitude, observableBatch: any[]) {
    if (aptitude.resistances && aptitude.resistances.length > 0) {
      aptitude.resistances.forEach(resistanceItem => {
        observableBatch.push(this.resistanceService.getResistance(resistanceItem.resistanceRef).map((resistance: Resistance) => {
          resistanceItem.resistance = resistance;
        }).first())
      });
    }
  }

  private getStatistiques(aptitude: Aptitude, observableBatch: any[]) {
    if (aptitude.statistiques && aptitude.statistiques.length > 0) {
      aptitude.statistiques.forEach(statistiqueItem => {
        observableBatch.push(this.statistiqueService.getStatistique(statistiqueItem.statistiqueRef).map((statistique: Statistique) => {
          statistiqueItem.statistique = statistique;
        }).first())
      });
    }
  }

  //#endregion

}