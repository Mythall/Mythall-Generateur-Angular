import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map, flatMap, first } from 'rxjs/operators';
import { FirestoreService } from '../firestore/firestore.service';
import { AptitudeService, AptitudeItem } from '../aptitude.service';
import { DonService, DonItem } from '../don.service';
import { SortService, SortItem } from '../sort.service';
import { Esprit } from './models/esprit';

@Injectable()
export class EspritService {

  constructor(
    private db: FirestoreService,
    private aptitudeService: AptitudeService,
    private donService: DonService,
    private sortService: SortService
  ) { }

  getEsprits(): Observable<Esprit[]> {
    return this.db.colWithIds$('esprits', ref => ref.orderBy("nom"));
  }

  getEsprit(id: string): Observable<Esprit> {
    return this.db.doc$('esprits/' + id).pipe(
      flatMap((esprit: Esprit) => {

        let observableBatch: Observable<any>[] = [];
        observableBatch.push(of(esprit));

        this._getAptitudees(esprit);
        this._getSorts(esprit);
        this._getDons(esprit);

        return forkJoin(observableBatch).pipe(
          map((data: any[]) => {
            let esprit: Esprit = this.map(data[0]);
            return esprit;
          })
        )

      })
    ) as Observable<Esprit>
  }

  addEsprit(esprit: Esprit) {
    return this.db.add('esprits', esprit, esprit.nom);
  }

  updateEsprit(id: string, esprit: Esprit) {
    return this.db.update('esprits/' + id, esprit, esprit.nom);
  }

  deleteEsprit(esprit: Esprit) {
    return this.db.delete('esprits/' + esprit.id, esprit.nom);
  }

  map(data: Esprit): Esprit {
    var esprit: Esprit = new Esprit();
    for (var key in data) {
      esprit[key] = data[key]
    }
    return esprit;
  }

  private _getAptitudees(esprit: Esprit): void {
    if (esprit.aptitudes && esprit.aptitudes.length > 0) {
      esprit.aptitudes.forEach(async (aptitudeItem: AptitudeItem) => {
        aptitudeItem.aptitude = await this.aptitudeService.getAptitude(aptitudeItem.aptitudeRef);
      });
    }
  }

  private _getDons(esprit: Esprit): void {
    if (esprit.dons && esprit.dons.length > 0) {
      esprit.dons.forEach(async (donItem: DonItem) => {
        donItem.don = await this.donService.getDon(donItem.donRef);
      });
    }
  }

  private _getSorts(esprit: Esprit): void {
    if (esprit.sorts && esprit.sorts.length > 0) {
      esprit.sorts.forEach(async (sortItem: SortItem) => {
        sortItem.sort = await this.sortService.getSort(sortItem.sortRef);
      });
    }
  }

}