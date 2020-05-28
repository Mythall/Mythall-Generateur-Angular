import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { FirestoreService } from '../firestore/firestore.service';
import { AptitudeService, AptitudeItem } from '../aptitude.service';
import { DonService, DonItem } from '../don.service';
import { SortService } from '../sort.service';
import { Domaine } from './models/domaine';
import { Classe } from '../classes/models/classe';
import { ClasseService } from '../classes/classe.service';
import { tap, map, flatMap, first } from 'rxjs/operators';

@Injectable()
export class DomaineService {

  constructor(
    private db: FirestoreService,
    private aptitudeService: AptitudeService,
    private classeService: ClasseService,
    private donService: DonService,
    private sortService: SortService
  ) { }

  getDomaines(): Observable<Domaine[]> {
    return this.db.colWithIds$('domaines', ref => ref.orderBy("nom")).pipe(
      tap(results => {
        results.sort((a: Domaine, b: Domaine) => {
          return a.nom.localeCompare(b.nom);
        })
      })
    );
  }

  getDomaine(id: string): Observable<Domaine> {
    return this.db.doc$('domaines/' + id).pipe(
      flatMap((domaine: Domaine) => {

        let observableBatch: Observable<any>[] = [];
        observableBatch.push(of(domaine));

        this.getClasses(domaine, observableBatch);
        this.getDomaineContraire(domaine, observableBatch);
        this._getAptitudees(domaine);
        this._getSorts(domaine);
        this._getDons(domaine);

        return forkJoin(observableBatch).pipe(
          map((data: any[]) => {
            let domaine: Domaine = this.map(data[0]);
            return domaine;
          })
        )

      })
    ) as Observable<Domaine>
  }

  getDomaineBase(id: string): Observable<Domaine> {
    return this.db.doc$('domaines/' + id);
  }

  addDomaine(domaine: Domaine) {
    return this.db.add('domaines', domaine, domaine.nom);
  }

  updateDomaine(domaine: Domaine) {
    return this.db.update('domaines/' + domaine.id, domaine, domaine.nom);
  }

  deleteDomaine(domaine: Domaine) {
    return this.db.delete('domaines/' + domaine.id, domaine.nom);
  }


  //#region Maps
  map(data: Domaine): Domaine {
    var domaine: Domaine = new Domaine();
    for (var key in data) {
      domaine[key] = data[key]
    }
    return domaine;
  }

  //#endregion

  //#region Private Methods

  private getClasses(domaine: Domaine, observableBatch: any[]) {
    if (domaine.multiclassementRef) {
      domaine.multiclassementRef.forEach(classeRef => {
        observableBatch.push(this.classeService.getClasseSummary(classeRef).pipe(
          map((classe: Classe) => {
            if (!domaine.multiclassement) domaine.multiclassement = [];
            domaine.multiclassement.push(classe);
          }),
          first()
        ))
      });
    }
  }

  private getDomaineContraire(domaine: Domaine, observableBatch: any[]) {
    this.getDomaineBase(domaine.domaineContraireRef).pipe(
      map((domaineContraire: Domaine) => {
        domaine.domaineContraire = domaineContraire;
      })
    );
  }

  private _getAptitudees(domaine: Domaine): void {
    if (domaine.aptitudes && domaine.aptitudes.length > 0) {
      domaine.aptitudes.forEach(async (aptitudeItem: AptitudeItem) => {
        aptitudeItem.aptitude = await this.aptitudeService.getAptitude(aptitudeItem.aptitudeRef);
      });
    }
  }

  private _getDons(domaine: Domaine): void {
    if (domaine.dons && domaine.dons.length > 0) {
      domaine.dons.forEach(async (donItem: DonItem) => {
        donItem.don = await this.donService.getDon(donItem.donRef);
      });
    }
  }

  private _getSorts(domaine: Domaine): void {
    if (domaine.sorts && domaine.sorts.length > 0) {
      domaine.sorts.forEach(async (sortItem) => {
        sortItem.sort = await this.sortService.getSort(sortItem.sortRef);
      });
    }
  }
  //#endregion

}