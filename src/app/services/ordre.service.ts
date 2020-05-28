import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ClasseService } from './classes/classe.service';
import { Classe } from './classes/models/classe';
import { IAlignement } from './alignement.service';

export interface IOrdre extends IOrdreDB {
  id: string;
  multiclassement: Classe[];
  alignementPermis: IAlignement[];
}

export interface IOrdreDB {
  nom: string;
  description: string;
  classeRef: string[];
  multiclassementRef: string[];
  alignementPermisRef: string[];
}

@Injectable()
export class OrdreService {

  constructor(
    private afs: AngularFirestore,
    private classeService: ClasseService
  ) { }

  public async getOrdres(): Promise<IOrdre[]> {
    return (await this.afs.collection<IOrdre>('ordres').ref.orderBy('nom').get()).docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as IOrdre;
    });
  }

  public async getOrdre(id: string): Promise<IOrdre> {
    const data = await this.afs.doc<IOrdre>(`ordres/${id}`).ref.get();
    const order = {
      id: data.id,
      ...data.data()
    } as IOrdre;
    this.getClasses(order);
    return order;
  }

  public async addOrdre(ordre: IOrdre): Promise<IOrdre> {
    const data = await this.afs.collection(`ordres`).add(this._saveState(ordre));
    return { id: data.id, ...ordre } as IOrdre;
  }

  public async updateOrdre(ordre: IOrdre): Promise<IOrdre> {
    await this.afs.doc<IOrdre>(`ordres/${ordre.id}`).update(this._saveState(ordre));
    return ordre;
  }

  public async deleteOrdre(id: string): Promise<boolean> {
    await this.afs.doc<IOrdre>(`ordres/${id}`).delete();
    return true;
  }

  private _saveState(item: IOrdre): IOrdreDB {
    return {
      nom: item.nom,
      description: item.description,
      classeRef: item.classeRef,
      multiclassementRef: item.multiclassementRef,
      alignementPermisRef: item.alignementPermisRef
    };
  }

  private getClasses(ordre: IOrdre): void {
    if (ordre.multiclassementRef) {
      ordre.multiclassementRef.forEach(async (classeRef) => {
        if (!ordre.multiclassement) ordre.multiclassement = [];
        ordre.multiclassement.push(await this.classeService.getClasseSummaryTemp(classeRef));
      });
    }
  }

}