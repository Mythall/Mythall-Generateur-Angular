import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, of, forkJoin } from 'rxjs';
import { mergeMap, map, tap, first } from 'rxjs/operators';
import { FirestoreService } from '../firestore/firestore.service';
import { Classe } from './models/classe';
import { AptitudeService, AptitudeItem } from '../aptitude.service';
import { SortService, SortItem } from '../sort.service';
import { ImmuniteService } from '../immunite.service';
import { ResistanceService, ResistanceItem } from '../resistance.service';
import { StatistiqueService, StatistiqueItem } from '../statistique.service';
import { DonItem } from '../don.service';

@Injectable()
export class ClasseService {
  donService: any;

  constructor(
    private afs: AngularFirestore,
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
        this._getAptitudees(classe);
        this._getSorts(classe);
        this._getDons(classe);
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

  public async getClasseSummaryTemp(id: string): Promise<Classe> {
    const data = await this.afs.doc<Classe>(`classes/${id}`).ref.get();
    return {
      id: data.id,
      ...data.data()
    } as Classe;
  }

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

  private _getAptitudees(classe: Classe): void {
    if (classe.aptitudes && classe.aptitudes.length > 0) {
      classe.aptitudes.forEach(async (aptitudeItem: AptitudeItem) => {
        aptitudeItem.aptitude = await this.aptitudeService.getAptitude(aptitudeItem.aptitudeRef);
      });
    }
  }

  private _getDons(classe: Classe): void {
    if (classe.dons && classe.dons.length > 0) {
      classe.dons.forEach(async (donItem: DonItem) => {
        donItem.don = await this.donService.getDon(donItem.donRef);
      });
    }
  }

  private _getSorts(classe: Classe): void {
    if (classe.sorts && classe.sorts.length > 0) {
      classe.sorts.forEach(async (sortItem: SortItem) => {
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

  private _getStatistiques(classe: Classe): void {
    if (classe.statistiques && classe.statistiques.length > 0) {
      classe.statistiques.forEach(async (statistiqueItem: StatistiqueItem) => {
        statistiqueItem.statistique = await this.statistiqueService.getStatistique(statistiqueItem.statistiqueRef);
      });
    }
  }

  private _getImmunites(classe: Classe): void {
    if (classe.immunitesRef) {
      classe.immunitesRef.forEach(async (immuniteRef) => {
        if (!classe.immunites) classe.immunites = [];
        classe.immunites.push(await this.immuniteService.getImmunite(immuniteRef));
      });
    }
  }

}