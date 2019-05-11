import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirestoreService } from '../firestore/firestore.service';
import { AptitudeService } from '../aptitudes/aptitude.service';
import { DonService } from '../dons/don.service';
import { SortService } from '../sorts/sort.service';
import { AptitudeItem, Aptitude } from '../aptitudes/models/aptitude';
import { Don } from '../dons/models/don';
import { Domaine } from './models/domaine';
import { Sort } from '../sorts/models/sort';
import { Classe } from '../classes/models/classe';
import { ClasseService } from '../classes/classe.service';

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
    return this.db.colWithIds$('domaines', ref => ref.orderBy("nom"));
  }

  getDomaine(id: string): Observable<Domaine> {
    return this.db.doc$('domaines/' + id).flatMap((domaine: Domaine) => {

      let observableBatch: Observable<any>[] = [];
      observableBatch.push(Observable.of(domaine));

      this.getClasses(domaine, observableBatch);
      this.getDomaineContraire(domaine, observableBatch);
      this.getAptitudees(domaine, observableBatch);
      this.getSorts(domaine, observableBatch);
      this.getDons(domaine, observableBatch);

      return Observable.forkJoin(observableBatch).map((data: any[]) => {
        let domaine: Domaine = this.map(data[0]);
        return domaine;
      })

    })
  }

  getDomaineBase(id: string): Observable<Domaine> {
    return this.db.doc$('domaines/' + id);
  }

  addDomaine(domaine: Domaine) {
    return this.db.add('domaines', domaine, domaine.nom);
  }

  updateDomaine(id: string, domaine: Domaine) {
    return this.db.update('domaines/' + id, domaine, domaine.nom);
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
        observableBatch.push(this.classeService.getClasseSummary(classeRef).map((classe: Classe) => {
          if (!domaine.multiclassement) domaine.multiclassement = [];
          domaine.multiclassement.push(classe);
        }).first())
      });
    }
  }

  private getDomaineContraire(domaine: Domaine, observableBatch: any[]) {
    this.getDomaineBase(domaine.domaineContraireRef).map((domaineContraire: Domaine) => {
      domaine.domaineContraire = domaineContraire;
    });
  }

  private getAptitudees(domaine: Domaine, observableBatch: any[]) {
    if (domaine.aptitudes && domaine.aptitudes.length > 0) {
      domaine.aptitudes.forEach(aptitudeItem => {
        observableBatch.push(this.aptitudeService.getAptitude(aptitudeItem.aptitudeRef).map((aptitude: Aptitude) => {
          aptitudeItem.aptitude = aptitude;
        }).first())
      });
    }
  }

  private getDons(domaine: Domaine, observableBatch: any[]) {
    if (domaine.dons && domaine.dons.length > 0) {
      domaine.dons.forEach(donItem => {
        observableBatch.push(this.donService.getDon(donItem.donRef).map((don: Don) => {
          donItem.don = don;
        }).first())
      });
    }
  }

  private getSorts(domaine: Domaine, observableBatch: any[]) {
    if (domaine.sorts && domaine.sorts.length > 0) {
      domaine.sorts.forEach(sortItem => {
        observableBatch.push(this.sortService.getSort(sortItem.sortRef).map((sort: Sort) => {
          sortItem.sort = sort;
        }).first())
      });
    }
  }
  //#endregion

}