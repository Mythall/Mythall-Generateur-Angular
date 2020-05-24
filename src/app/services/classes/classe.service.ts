import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { mergeMap, map, tap, first } from 'rxjs/operators';
import { FirestoreService } from '../firestore/firestore.service';
import { Classe } from './models/classe';
import { Aptitude } from '../aptitudes/models/aptitude';
import { Don } from '../dons/models/don';
import { AptitudeService } from '../aptitudes/aptitude.service';
import { SortService } from '../sort.service';
import { ImmuniteService } from '../immunite.service';
import { ResistanceService, ResistanceItem } from '../resistance.service';
import { StatistiqueService, StatistiqueItem } from '../statistique.service';

@Injectable()
export class ClasseService {

  constructor(
    private db: FirestoreService,
    private aptitudeService: AptitudeService,
    private sortService: SortService,
    private immuniteService: ImmuniteService,
    private resistanceService: ResistanceService,
    private statistiqueService: StatistiqueService,
  ) { }

  getClasses(): Observable<Classe[]> {
    return this.db.colWithIds$('classes', ref => ref.orderBy("nom")).pipe(
      tap(results => {
        results.sort((a: Classe, b: Classe) => {
          return a.nom.localeCompare(b.nom);
        })
      })
    );
  }

  getClasse(id: string): Observable<Classe> {
    return this.db.doc$('classes/' + id).pipe(
      mergeMap((classe: Classe) => {

        let observableBatch: Observable<any>[] = [];
        observableBatch.push(of(classe));

        this.getMulticlassement(classe, observableBatch);
        this.getAptitudees(classe, observableBatch);
        this.getSorts(classe);
        this.getDons(classe, observableBatch);
        this._getResistances(classe);
        this._getStatistiques(classe);
        this._getImmunites(classe);

        return forkJoin(observableBatch).pipe(
          map((data: any[]) => {
            let classe: Classe = this.map(data[0]);
            return classe;
          })
        )

      })
    ) as Observable<Classe>
  }

  addClasse(classe: Classe) {
    return this.db.add('classes', classe, classe.nom);
  }

  updateClasse(id: string, classe: Classe) {
    return this.db.update('classes/' + id, classe, classe.nom);
  }

  deleteClasse(classe: Classe) {
    return this.db.delete('classes/' + classe.id, classe.nom);
  }

  getClasseSummary(id: string): Observable<Classe> {
    return this.db.doc$('classes/' + id);
  }

  getClassesStandard(): Observable<Classe[]> {
    return this.db.colWithIds$('classes', ref => ref.where('prestige', '==', false).orderBy("nom"))
    // .map((classes: Classe[]) => {
    //   classes.forEach(classe => {
    //     classe.multiclassementRef.forEach(multiRef => {
    //       this.getClasseSummary(multiRef).subscribe(multi => {
    //         classe.multiclassement.push(multi);
    //       });
    //     });
    //   });
    //   return classes;
    // });
  }

  getClassesPrestige(): Observable<Classe[]> {
    return this.db.colWithIds$('classes', ref => ref.where('prestige', '==', true).orderBy("nom")).pipe(
      tap(results => {
        results.sort((a: Classe, b: Classe) => {
          return a.nom.localeCompare(b.nom);
        })
      })
    );
  }

  //#region Maps
  map(data: Classe): Classe {
    var classe: Classe = new Classe();
    for (var key in data) {
      classe[key] = data[key]
    }
    return classe;
  }
  //#endregion

  //#region Private Methods

  private getMulticlassement(classe: Classe, observableBatch: any[]) {
    if (classe.multiclassementRef) {
      classe.multiclassementRef.forEach(classeRef => {
        observableBatch.push(this.getClasseSummary(classeRef).pipe(
          map((classe: Classe) => {
            if (!classe.multiclassement) classe.multiclassement = [];
            classe.multiclassement.push(classe);
          }),
          first()
        ))
      });
    }
  }

  private getAptitudees(classe: Classe, observableBatch: any[]) {
    if (classe.aptitudes && classe.aptitudes.length > 0) {
      classe.aptitudes.forEach(aptitudeItem => {
        observableBatch.push(this.aptitudeService.getAptitude(aptitudeItem.aptitudeRef).pipe(
          map((aptitude: Aptitude) => {
            aptitudeItem.aptitude = aptitude;
          }),
          first()
        ))
      });
    }
  }

  private getDons(classe: Classe, observableBatch: any[]) {
    if (classe.dons && classe.dons.length > 0) {
      classe.dons.forEach(donItem => {
        observableBatch.push(this.db.doc$('dons/' + donItem.donRef).pipe(
          map((don: Don) => {
            donItem.don = don;
          }),
          first()
        ))
      });
    }
  }

  private getSorts(classe: Classe) {
    if (classe.sorts && classe.sorts.length > 0) {
      classe.sorts.forEach(async (sortItem) => {
        sortItem.sort = await this.sortService.getSort(sortItem.sortRef);
      });
    }
  }

  private _getResistances(classe: Classe): void {
    if (classe.resistances && classe.resistances.length > 0) {
      classe.resistances.forEach(async (resistanceItem: ResistanceItem) => {
        resistanceItem.resistance = await this.resistanceService.getResistance(resistanceItem.resistanceRef);
      });
    }
  }

  private _getStatistiques(classe: Classe) {
    if (classe.statistiques && classe.statistiques.length > 0) {
      classe.statistiques.forEach(async (statistiqueItem: StatistiqueItem) => {
        statistiqueItem.statistique = await this.statistiqueService.getStatistique(statistiqueItem.statistiqueRef);
      });
    }
  }

  private _getImmunites(classe: Classe) {
    if (classe.immunitesRef) {
      classe.immunitesRef.forEach(async (immuniteRef) => {
        if (!classe.immunites) classe.immunites = [];
        classe.immunites.push(await this.immuniteService.getImmunite(immuniteRef));
      });
    }
  }

  //#endregion

}