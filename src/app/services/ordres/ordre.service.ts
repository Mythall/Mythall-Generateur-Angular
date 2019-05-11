import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FirestoreService } from '../firestore/firestore.service';
import { Ordre } from './models/ordre';
import { ClasseService } from '../classes/classe.service';
import { Classe } from '../classes/models/classe';

@Injectable()
export class OrdreService {

  constructor(
    private db: FirestoreService,
    private classeService: ClasseService
  ) { }

  getOrdres(): Observable<Ordre[]>{
    return this.db.colWithIds$('ordres', ref => ref.orderBy("nom"));
  }

  getOrdre(id: string): Observable<Ordre> {
    return this.db.doc$('ordres/' + id).flatMap((ordre: Ordre) => {

      let observableBatch: Observable<any>[] = [];
      observableBatch.push(Observable.of(ordre));

      this.getClasses(ordre, observableBatch);

      return Observable.forkJoin(observableBatch).map((data: any[]) => {
        let ordre: Ordre = this.map(data[0]);
        return ordre;
      })

    })
  }

  addOrdre(ordre: Ordre){
    return this.db.add('ordres', ordre, ordre.nom);
  }

  updateOrdre(id: string, ordre: Ordre){
    return this.db.update('ordres/' + id, ordre, ordre.nom);
  }

  deleteOrdre(ordre: Ordre){
    return this.db.delete('ordres/' + ordre.id, ordre.nom);
  }

  map(data: Ordre): Ordre {
    var ordre: Ordre = new Ordre();
    for (var key in data) {
      ordre[key] = data[key]
    }
    return ordre;
  }

  private getClasses(ordre: Ordre, observableBatch: any[]) {
    if (ordre.multiclassementRef) {
      ordre.multiclassementRef.forEach(classeRef => {
        observableBatch.push(this.classeService.getClasseSummary(classeRef).map((classe: Classe) => {
          if (!ordre.multiclassement) ordre.multiclassement = [];
          ordre.multiclassement.push(classe);
        }).first())
      });
    }
  }

}