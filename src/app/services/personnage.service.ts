import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../layout/dialogs/loading/loading.dialog.component';
import { AptitudeService, AptitudeItem } from './aptitude.service';
import { ClasseService, ClasseItem, IClasse } from './classe.service';
import { DonService, IDon, DonItem } from './don.service';
import { RaceService, IRace } from './race.service';
import { UserService, IUser } from './@core/user.service';
import { StatistiqueService, StatistiqueValue, StatistiqueIds } from './statistique.service';
import { DomaineService, IDomaine } from './domaine.service';
import { IDieu, DieuService } from './dieu.service';
import { IAlignement, AlignementService } from './alignement.service';
import { EspritService, IEsprit } from './esprit.service';
import { SortService, SortItem, ISort } from './sort.service';
import { OrdreService, IOrdre } from './ordre.service';
import { FourberieService, IFourberie, FourberieItem } from './fourberie.service';
import { EcoleService, IEcole } from './ecole.service';
import { ResistanceValue } from './resistance.service';
import { IImmunite } from './immunite.service';

export interface IPersonnage extends IPersonnageDB {
  id: string;
  user: IUser;
  alignement: IAlignement;
  race: IRace;
  statistiques: StatistiqueValue[];
  capaciteSpeciales: StatistiqueValue[]; //Display Only, not saved
  resistances: ResistanceValue[];
  immunites: IImmunite[];
  esprit: IEsprit;
  ecole: IEcole;
  dieu: IDieu;
  ordres: IOrdre[];
  domaines: IDomaine[];
  niveauEffectif: number;
  niveauReel: number;
  niveauProfane: number;
  niveauDivin: number;
  niveauDisponible: number;
}

export interface IPersonnageDB {
  nom: string;
  userRef: string;
  classes: ClasseItem[];
  alignementRef: string;
  dons: DonItem[];
  aptitudes: AptitudeItem[];
  sorts: SortItem[];
  fourberies: FourberieItem[];
  raceRef: string;
  gnEffectif: number;
  espritRef: string;
  ecoleRef: string;
  dieuRef: string;
  ordresRef: string[];
  domainesRef: string[];
  vie: number;
}

export class Choix {

  constructor() {
    this.type = '';
    this.quantite = 1;
    this.niveauObtention = 0;
    this.ref = [];
  }

  type: string;
  quantite: number;
  niveauObtention: number;
  categorie?: string;
  domaine: boolean;
  ref: string[]; // Référence pour choix de don, sort, aptitude, fourberie
}

export const ChoixTypes: string[] = [
  'aptitude',
  'connaissance',
  'don',
  'domaine',
  'ecole',
  'esprit',
  'fourberie',
  'ordre',
  'sort'
]

@Injectable()
export class PersonnageService {

  constructor(
    private afs: AngularFirestore,
    private dialog: MatDialog,
    private alignementService: AlignementService,
    private aptitudeService: AptitudeService,
    private classeService: ClasseService,
    private domaineService: DomaineService,
    private donService: DonService,
    private dieuService: DieuService,
    private ecoleService: EcoleService,
    private espritService: EspritService,
    private fourberieService: FourberieService,
    private ordreService: OrdreService,
    private raceService: RaceService,
    private sortService: SortService,
    private statistiqueService: StatistiqueService,
    private userService: UserService
  ) { }

  public async getPersonnages(userId?: string): Promise<IPersonnage[]> {
    let query = this.afs.collection<IPersonnage>('personnages').ref.orderBy('createdAt');
    if (userId) {
      query = query.where('userRef', '==', userId);
    }
    return (await query.get()).docs.map(doc => {
      return {
        id: doc.id,
        ...doc.data()
      } as IPersonnage;
    });
  }

  public async getPersonnage(id: string): Promise<IPersonnage> {
    const data = await this.afs.doc<IPersonnage>(`personnages/${id}`).ref.get();
    return {
      id: data.id,
      ...data.data()
    } as IPersonnage;
  }

  public async addPersonnage(personnage: IPersonnage): Promise<IPersonnage> {
    const data = await this.afs.collection(`personnages`).add(this._saveState(personnage));
    return { id: data.id, ...personnage } as IPersonnage;
  }

  public async updatePersonnage(personnage: IPersonnage): Promise<IPersonnage> {
    await this.afs.doc<IPersonnage>(`personnages/${personnage.id}`).update(this._saveState(personnage));
    return personnage;
  }

  public async deletePersonnage(id: string): Promise<boolean> {
    await this.afs.doc<IPersonnage>(`personnages/${id}`).delete();
    return true;
  }

  private _saveState(item: IPersonnage): IPersonnageDB {
    if (!item.dieuRef) item.dieuRef = '';
    if (!item.ecoleRef) item.ecoleRef = '';
    if (!item.espritRef) item.espritRef = '';
    if (!item.ordresRef) item.ordresRef = [];
    if (!item.domainesRef) item.domainesRef = [];

    // Filter Out Race Dons / Sorts / Fourberies / Aptitudes
    if (item.race) {

      // Race
      if (item.dons && item.dons.length > 0) {
        let donsTemporaire: DonItem[] = [];
        item.dons.forEach(don => {
          let found: boolean = false;
          item.race.donsRacialRef.forEach(id => {
            if (id == don.donRef) {
              found = true;
            }
          });

          if (!found) {
            donsTemporaire.push(don);
          }

        });
        item.dons = donsTemporaire;
      }

      // Sorts
      if (item.sorts && item.sorts.length > 0) {
        let sortsTemporaire: SortItem[] = [];
        item.sorts.forEach(sort => {
          let found: boolean = false;
          item.race.sortsRacialRef.forEach(id => {
            if (id == sort.sortRef) {
              found = true;
            }
          });

          if (!found) {
            sortsTemporaire.push(sort);
          }

        });
        item.sorts = sortsTemporaire;
      }

      // Aptitudes
      if (item.aptitudes && item.aptitudes.length > 0) {
        let aptitudesTemporaire: AptitudeItem[] = [];
        item.aptitudes.forEach(aptitude => {
          let found: boolean = false;
          item.race.aptitudesRacialRef.forEach(id => {
            if (id == aptitude.aptitudeRef) {
              found = true;
            }
          });

          if (!found) {
            aptitudesTemporaire.push(aptitude);
          }

        });
        item.aptitudes = aptitudesTemporaire;
      }

    }

    //Filter Out Populated Objects
    item.classes.forEach(classeItem => {
      classeItem.classe = null;
    });
    item.dons.forEach(donItem => {
      donItem.don = null;
    });
    item.aptitudes.forEach(aptitudeItem => {
      aptitudeItem.aptitude = null;
    });
    item.sorts.forEach(sortItem => {
      sortItem.sort = null;
    });
    item.fourberies.forEach(fourberieItem => {
      fourberieItem.fourberie = null;
    });

    return {
      nom: item.nom,
      classes: item.classes.map((obj) => { return { ...obj } }),
      alignementRef: item.alignementRef,
      dons: item.dons.map((obj) => { return { ...obj } }),
      aptitudes: item.aptitudes.map((obj) => { return { ...obj } }),
      sorts: item.sorts.map((obj) => { return { ...obj } }),
      fourberies: item.fourberies.map((obj) => { return { ...obj } }),
      raceRef: item.raceRef,
      userRef: item.userRef,
      ecoleRef: item.ecoleRef,
      espritRef: item.espritRef,
      dieuRef: item.dieuRef,
      ordresRef: item.ordresRef,
      domainesRef: item.domainesRef,
      vie: item.vie,
      gnEffectif: item.gnEffectif,
    }
  }


  public async getChoixPersonnage(personnage: IPersonnage, progressingClasse: ClasseItem): Promise<Choix[]> {

    let listChoix: Choix[] = [];

    // Dons aux 3 niveaux & don niveau 1
    if (personnage.niveauReel % 3 == 0 || personnage.niveauReel == 1) {

      const don: Choix = new Choix();
      don.type = 'don';
      don.categorie = 'Normal';
      don.niveauObtention = personnage.niveauReel;
      don.quantite = 1;

      listChoix.push(Object.assign({}, don));

    }

    // Don Racial Humain
    if (personnage.raceRef == 'RkYWeQrxFkmFaepDM09n' && personnage.niveauReel == 1) {

      const don: Choix = new Choix();
      don.type = 'don';
      don.categorie = 'Normal';
      don.niveauObtention = 1;
      don.quantite = 1;

      listChoix.push({ ...don });

    }

    // Don Racial Elf
    if (personnage.raceRef == '5hteaYQ4K8J1MaAvU9Zh' && personnage.niveauReel == 1) {

      const don: Choix = new Choix();
      don.type = 'don';
      don.categorie = 'Connaissance';
      don.niveauObtention = 1;
      don.quantite = 1;

      listChoix.push({ ...don });

    }

    // Get Choix de Classe
    if (personnage.classes) {
      personnage.classes.forEach(classeItem => {

        // Choix de classe
        if (classeItem.classeRef == progressingClasse.classeRef && classeItem.niveau == progressingClasse.niveau) {
          classeItem.classe.choix.forEach(choix => {
            if (choix.niveauObtention == progressingClasse.niveau) {
              listChoix.push(choix);
            }
          });
        }

      });
    }

    // Domaines
    if (personnage.domaines && personnage.domaines.length > 0) {
      personnage.domaines.forEach(domaine => {

        // Prêtre
        if (progressingClasse.classeRef == 'fNqknNgq0QmHzUaYEvEd') {
          domaine.choix.forEach(choixDomaine => {
            if (choixDomaine.niveauObtention == progressingClasse.niveau) {
              listChoix.push(choixDomaine);
            }
          });
        }

      });
    }

    // ...

    return listChoix;

  }

  public getChoixClasse(personnage: IPersonnage, progressingClasse: ClasseItem): Choix[] {

    let listChoix: Choix[] = [];

    // Get All Classes Choices
    if (personnage.classes) {
      personnage.classes.forEach(classeItem => {

        // Choix de classe
        if (classeItem.classeRef == progressingClasse.classeRef && classeItem.niveau == progressingClasse.niveau) {
          classeItem.classe.choix.forEach(choix => {
            listChoix.push(choix);
          });
        }

      });
    }

    return listChoix;

  }

  public getChoixDomaine(personnage: IPersonnage, progressingClasse: ClasseItem): Choix[] {

    let listChoix: Choix[] = [];

    // Get All Classes Choices
    if (progressingClasse.classeRef == 'fNqknNgq0QmHzUaYEvEd') {
      personnage.classes.forEach(classeItem => {

        // Choix de domaine
        if (classeItem.classeRef == 'fNqknNgq0QmHzUaYEvEd' && progressingClasse.niveau == classeItem.niveau) { // ID de prêtre
          personnage.domaines.forEach(domaine => {
            domaine.choix.forEach(choix => {
              listChoix.push(choix);
            });
          });
        }

      });
    }

    return listChoix;

  }

  public async getAvailableAlignements(personnage: IPersonnage): Promise<IAlignement[]> {

    let alignements = await this.alignementService.getAlignements();

    // Filtre selon la race
    if (personnage.race) {
      alignements = alignements.filter((alignement) => {
        return personnage.race.alignementPermisRef.includes(alignement.id);
      });
    }

    // Filtre selon les classes
    if (personnage.classes) {
      personnage.classes.forEach(classe => {
        alignements = alignements.filter((alignement) => {
          return classe.classe.alignementPermisRef.includes(alignement.id);
        });
      });
    }

    return alignements;

  }

  public async getAvailableClasses(personnage: IPersonnage): Promise<IClasse[]> {

    let list = await this.classeService.getClasses();

    // Filtre selon la race
    if (personnage.race) {
      list = list.filter((classe) => {
        return personnage.race.classesDisponibleRef.includes(classe.id);
      });
    }

    // Filtre selon les classes
    if (personnage.classes) {
      personnage.classes.forEach(classePerso => {

        // Multiclassement
        list = list.filter((classe) => {
          return classePerso.classe.multiclassementRef.includes(classe.id);
        });

        // Ajoute la classe actuelle (Filtré au multiclassement);
        list.push(classePerso.classe);

        // Alignement Permis
        if (personnage.alignementRef) {
          list = list.filter((classe) => {
            return classePerso.classe.alignementPermisRef.includes(personnage.alignementRef);
          });
        }

      });
    }

    // Ordres
    if (personnage.ordres && personnage.ordres.length > 0) {
      personnage.ordres.forEach(ordre => {
        list = list.filter((classe) => {
          return ordre.classeRef.includes(classe.id);
        });
      })
    }

    // Domaines
    if (personnage.domaines && personnage.domaines.length > 0) {
      personnage.domaines.forEach(domaine => {
        list = list.filter((classe) => {
          return domaine.multiclassementRef.includes(classe.id);
        });
      })
    }

    // Ajoute les classes existante
    if (personnage.classes) {

      // Retire les autres classes si déjà 3 existantes
      if (personnage.classes.length >= 3) {
        list = [];
      }

      // Ajoute Chaques classe existante
      personnage.classes.forEach(classePerso => {
        list.push(classePerso.classe);
      });

      // Filtre les doubles
      list = list.filter((obj, pos, arr) => {
        return arr.map(mapObj => mapObj['id']).indexOf(obj['id']) === pos;
      });

    }

    // Trie en Ordre Alphabetic
    list = list.sort((a, b) => {
      if (a.nom > b.nom) {
        return 1;
      }
      if (a.nom < b.nom) {
        return -1;
      }
      return 0;
    });

    return list;

  }

  public async getAvailableConnaissances(personnage: IPersonnage): Promise<IDon[]> {

    const dons = await this.donService.getDons('Connaissance');

    let list: IDon[] = dons;

    // Filtre les dons déjà existant
    if (personnage.dons && personnage.dons.length > 0) {
      personnage.dons.forEach(donPerso => {

        list = list.filter(don => {
          return don.id != donPerso.donRef;
        })

      });
    }

    // Filtre les prérequis de dons
    if (personnage.dons) {

      let result: IDon[] = [];

      list.forEach(don => {

        let add: boolean = true;

        // No requirements
        if (don.donsRequisRef && don.donsRequisRef.length > 0) {

          // Make sure all requirements is filled
          don.donsRequisRef.forEach(donReqRef => {

            let found: boolean = false;

            personnage.dons.forEach(donPerso => {

              if (donReqRef == donPerso.donRef) {
                found = true;
              }

            });

            if (!found) {
              add = false;
            }

          });
        }

        if (add) {
          result.push(don);
        }

      });

      list = result;

    }

    // Filtre les restrictions de niveaux
    if (personnage.niveauReel) {

      // Filtre Niveau Max D'Obtention
      list = list.filter(don => {
        return don.niveauMaxObtention <= personnage.niveauReel
      });

      // Filtre Niveau Requis
      list = list.filter(don => {
        return don.niveauRequis <= personnage.niveauReel;
      });

    }

    // Trie en Ordre Alphabetic
    list = list.sort((a, b) => {
      if (a.nom > b.nom) {
        return 1;
      }
      if (a.nom < b.nom) {
        return -1;
      }
      return 0;
    });

    return list;

  }

  public async getAvailableDons(personnage: IPersonnage): Promise<IDon[]> {

    const dons = await this.donService.getDons();

    let list: IDon[] = dons;

    // Filtre les dons déjà existant
    if (personnage.dons && personnage.dons.length > 0) {
      personnage.dons.forEach(donPerso => {

        list = list.filter(don => {
          return don.id != donPerso.donRef;
        })

      });
    }

    // Filtre les Race Authorisé
    if (personnage.raceRef) {
      list = list.filter(function (don) {
        return don.racesAutoriseRef.includes(personnage.raceRef);
      });
    }

    // Filtre les classes authorisé
    if (personnage.classes) {

      let result: IDon[] = [];

      list.forEach(don => {
        don.classesAutorise.forEach(ca => {
          personnage.classes.forEach(classePerso => {
            if (classePerso.classeRef == ca.classeRef && classePerso.niveau >= ca.niveau) {
              if (!result.find(r => r.id == don.id)) {
                result.push(don);
              }
            }
          });
        });
      });

      list = result;

    }

    // Filtre les prérequis de dons
    if (personnage.dons) {

      let result: IDon[] = [];

      list.forEach(don => {

        let add: boolean = true;

        // No requirements
        if (don.donsRequisRef && don.donsRequisRef.length > 0) {

          // Make sure all requirements is filled
          don.donsRequisRef.forEach(donReqRef => {

            let found: boolean = false;

            personnage.dons.forEach(donPerso => {

              if (donReqRef == donPerso.donRef) {
                found = true;
              }

            });

            if (!found) {
              add = false;
            }

          });
        }

        if (add) {
          if (!result.find(r => r.id == don.id)) {
            result.push(don);
          }
          result.push(don);
        }

      });

      list = result;

    }

    // Filtre les restrictions de niveaux
    if (personnage.niveauReel) {

      // Filtre Niveau Max D'Obtention
      list = list.filter(don => {
        return don.niveauMaxObtention <= personnage.niveauReel
      });

      // Filtre Niveau Requis
      list = list.filter(don => {
        return don.niveauRequis <= personnage.niveauReel;
      });

    }

    // Trie en Ordre Alphabetic
    list = list.sort((a, b) => {
      if (a.nom > b.nom) {
        return 1;
      }
      if (a.nom < b.nom) {
        return -1;
      }
      return 0;
    });

    // Filter Duplicates
    list = list.filter((don, index, self) =>
      index === self.findIndex((d) => (
        d.id === don.id
      ))
    );

    return list;

  }

  public async getAvailableDomaines(personnage: IPersonnage): Promise<IDomaine[]> {

    let list = await this.domaineService.getDomaines();

    // Filtre selon l'alignement du personnage
    if (personnage.alignementRef) {
      list = list.filter((domaine) => {
        return domaine.alignementPermisRef.includes(personnage.alignementRef);
      });
    }

    // Filtre selon les domaines du personnage
    if (personnage.domaines && personnage.domaines.length > 0) {
      personnage.domaines.forEach(domainePersonnage => {

        // Filtre domaine existant
        list = list.filter((domaine) => {
          return domaine.id != domainePersonnage.id;
        });

        // Filtre domaine oposé
        list = list.filter((domaine) => {
          return domaine.id != domainePersonnage.domaineContraireRef;
        });

      });
    }

    return list;

  }

  public async getAvailableEcoles(): Promise<IEcole[]> {
    return await this.ecoleService.getEcoles();
  }

  public async getAvailableEsprits(): Promise<IEsprit[]> {
    return await this.espritService.getEsprits();
  }

  public async getAvailableOrdres(personnage: IPersonnage): Promise<IOrdre[]> {

    const ordres = await this.ordreService.getOrdres();

    let list: IOrdre[] = ordres;

    // Filtre selon l'alignement du personnage
    if (personnage.alignementRef) {
      list = list.filter(function (ordre) {
        return ordre.alignementPermisRef.includes(personnage.alignementRef);
      });
    }

    // Filtre selon les classes
    if (personnage.classes) {
      personnage.classes.forEach(classe => {
        list = list.filter(function (ordre) {
          return ordre.classeRef.includes(classe.classeRef);
        });
      });
    }

    return list;

  }

  public async getAvailableFourberies(personnage: IPersonnage): Promise<IFourberie[]> {

    const fourberies = await this.fourberieService.getFourberies();

    let list: IFourberie[] = fourberies;

    // Filtre les fourberies déjà existant
    if (personnage.fourberies && personnage.fourberies.length > 0) {
      personnage.fourberies.forEach(fourberiesPerso => {

        list = list.filter(fourberie => {
          return fourberie.id != fourberiesPerso.fourberieRef;
        })

      });
    }

    // Filtre les prérequis de fourberie
    if (personnage.fourberies) {

      let result: IFourberie[] = [];

      list.forEach(fourberie => {

        let add: boolean = true;

        // No requirements
        if (fourberie.fourberiesRequisRef && fourberie.fourberiesRequisRef.length > 0) {

          // Make sure all requirements is filled
          fourberie.fourberiesRequisRef.forEach(fourberieReqRef => {

            let found: boolean = false;

            personnage.fourberies.forEach(fourberiePerso => {

              if (fourberieReqRef == fourberiePerso.fourberieRef) {
                found = true;
              }

            });

            if (!found) {
              add = false;
            }

          });
        }

        if (add) {
          result.push(fourberie);
        }

      });

      list = result;

    }

    // Trie en Ordre Alphabetic
    list = list.sort((a, b) => {
      if (a.nom > b.nom) {
        return 1;
      }
      if (a.nom < b.nom) {
        return -1;
      }
      return 0;
    });

    return list;

  }

  public async getAvailableSorts(personnage: IPersonnage): Promise<ISort[]> {

    let list: ISort[] = [];

    // Get list de sort disponible
    if (personnage.classes) {

      personnage.classes.forEach((classe) => {
        classe.classe.sortsDisponible.forEach(async (sortDispo) => {
          if (sortDispo.niveauObtention <= classe.niveau) {
            list.push(await this.sortService.getSort(sortDispo.sortRef));
          }
        });
      });

    }

    // Filtre les sorts déjà existant
    if (personnage.sorts && personnage.sorts.length > 0) {
      personnage.sorts.forEach(sortPerso => {

        list = list.filter(sort => {
          return sort.id != sortPerso.sortRef;
        })

      });
    }

    // Trie en Ordre Alphabetic
    list = list.sort((a, b) => {
      if (a.nom > b.nom) {
        return 1;
      }
      if (a.nom < b.nom) {
        return -1;
      }
      return 0;
    });

    return list;

  }

  public async getAvailableDieux(personnage: IPersonnage): Promise<IDieu[]> {

    let list = await this.dieuService.getDieux();

    // Filtre selon l'alignement du personnage
    if (personnage.alignementRef) {
      list = list.filter(function (dieu) {
        return dieu.alignementPermisRef.includes(personnage.alignementRef);
      });
    }

    // Trie en Ordre Alphabetic
    list = list.sort((a, b) => {
      if (a.nom > b.nom) {
        return 1;
      }
      if (a.nom < b.nom) {
        return -1;
      }
      return 0;
    });

    return list;
  }



  public async buildPersonnage(personnage: IPersonnage): Promise<IPersonnage> {

    try {
      this.dialog.open(LoadingDialogComponent);

      console.log("Building Personnage...");
      await Promise.all([
        this._getUser(personnage),
        this._getRace(personnage),
        this._getClasses(personnage),
        this._getAlignement(personnage),
        this._getDieu(personnage),
        this._getOrdres(personnage),
        this.getAllFourberies(personnage)
      ]);

      console.log("Building Niveau Effectif...");
      await this._getNiveauEffectif(personnage);

      console.log("Building Domaines & Esprits...");
      await Promise.all([
        this._getDomaines(personnage),
        this._getEsprit(personnage)
      ]);

      console.log("Building Aptitudes...");
      await this._getAllAptitudes(personnage);

      console.log("Building Sorts & Dons...");
      await Promise.all([
        this._getAllSorts(personnage),
        this.getAllDons(personnage)
      ]);

      console.log("Building Base Statistiques...");
      await this._getStatistiquesParDefault(personnage);

      console.log('Building Statistiques, Resistances & Immunities...');
      await Promise.all([
        this._getStatistiques(personnage),
        this._getResistances(personnage),
        this._getImmunites(personnage)
      ]);

      console.log("Building Niveau de dons & Capacité spéciales...");
      await Promise.all([
        this._getDonsNiveauEffectif(personnage),
        this._getCapaciteSpeciales(personnage)
      ]);

      console.log("Personnage Build Completed");
      console.log(personnage);

      // Completed
      this.dialog.closeAll();

      // Resolving
      return personnage;
    } catch (error) {
      console.log(error);
      // ...
      // Mettre une dialog d'erreur ici pour indiquer au joueur que sa fiche n'as pas loadé
    }

  }

  private async _getUser(personnage: IPersonnage): Promise<IPersonnage> {
    personnage.user = await this.userService.getUser(personnage.userRef)
    return personnage;
  }

  private async _getRace(personnage: IPersonnage): Promise<IPersonnage> {
    personnage.race = await this.raceService.getRace(personnage.raceRef);
    return personnage;
  }

  private async _getClasses(personnage: IPersonnage): Promise<IPersonnage> {

    // ...
    // Pretty sure we can optimize load time with a promise.all here
    personnage.classes.forEach(async (classeItem) => {
      classeItem.classe = await this.classeService.getClasse(classeItem.classeRef);
    });

    return personnage;

  }

  private async _getAlignement(personnage: IPersonnage): Promise<IPersonnage> {
    if (personnage.alignementRef) {
      try {
        personnage.alignement = await this.alignementService.getAlignement(personnage.alignementRef);
      } catch (e) {
        console.log('Une erreure est survenue lors de la requete pour l\'alignement du personnage');
      }
    }
    return personnage;
  }

  private async _getDieu(personnage: IPersonnage): Promise<IPersonnage> {
    if (personnage.dieuRef) {
      try {
        personnage.dieu = await this.dieuService.getDieu(personnage.dieuRef);
      } catch (e) {
        console.log('Une erreure est survenue lors de la requete pour le dieu du personnage');
      }
    }
    return personnage;
  }

  private async _getOrdres(personnage: IPersonnage): Promise<IPersonnage> {

    // Retourne seulement la liste des ordres du personnage
    let count: number = 0;
    if (!personnage.ordresRef) personnage.ordresRef = [];

    if (personnage.ordresRef && personnage.ordresRef.length > 0) {
      personnage.ordresRef.forEach(async (ordreRef) => {
        const ordre = await this.ordreService.getOrdre(ordreRef);
        if (!personnage.ordres) personnage.ordres = [];
        personnage.ordres.push(ordre);
        count++;
        if (count == personnage.ordresRef.length) {
          return personnage;
        }
      });
    } else {
      return personnage;
    }
  }

  private async _getNiveauEffectif(personnage: IPersonnage): Promise<IPersonnage> {

    personnage.niveauEffectif = 0;
    personnage.niveauReel = 0;
    personnage.niveauProfane = 0;
    personnage.niveauDivin = 0;

    if (personnage.classes) {

      personnage.classes.forEach(classe => {
        personnage.niveauEffectif += classe.niveau;
        personnage.niveauReel += classe.niveau;

        if (classe.classe.sort == 'Profane') {
          personnage.niveauProfane += classe.niveau;
        }

        if (classe.classe.sort == 'Divin') {
          personnage.niveauDivin += classe.niveau;
        }

      });

    }

    if (personnage.race) {
      if (personnage.race.ajustement) {
        personnage.niveauEffectif += +personnage.race.ajustement;
        personnage.niveauProfane += +personnage.race.ajustement;
        personnage.niveauDivin += +personnage.race.ajustement;
      }
    }

    return personnage;

  }

  private async _getDomaines(personnage: IPersonnage): Promise<IPersonnage> {

    if (personnage.domainesRef && personnage.domainesRef.length > 0) {

      let count: number = 0;

      personnage.domainesRef.forEach(async (domaineRef) => {
        const domaine = await this.domaineService.getDomaine(domaineRef)
        if (!personnage.domaines) personnage.domaines = [];
        personnage.domaines.push(domaine);
        count++;
        if (count == personnage.domainesRef.length) {
          return personnage;
        }
      });

    } else {
      return personnage;
    }

  }

  private async _getEsprit(personnage: IPersonnage): Promise<IPersonnage> {

    if (personnage.espritRef) {
      const response = await this.espritService.getEsprit(personnage.espritRef);
      personnage.esprit = response;
      return personnage;
    }

    return personnage;

  }

  private async getAllFourberies(personnage: IPersonnage): Promise<IPersonnage> {

    let count: number = 0;
    if (!personnage.fourberies) personnage.fourberies = [];

    if (personnage.fourberies && personnage.fourberies.length > 0) {

      personnage.fourberies.forEach(async (fourberieItem) => {

        if (!fourberieItem.fourberie) { //Avoid fetching Fourberie if already fetch

          fourberieItem.fourberie = await this.fourberieService.getFourberie(fourberieItem.fourberieRef);
          count++;

          if (count == personnage.fourberies.length) {

            // Filter Duplicates
            personnage.fourberies = personnage.fourberies.filter((fourberie, index, self) =>
              index === self.findIndex((d) => (
                d.fourberieRef === fourberie.fourberieRef
              ))
            )

            return personnage;

          }

        } else {

          count++;

          if (count == personnage.fourberies.length) {

            // Filter Duplicates
            personnage.fourberies = personnage.fourberies.filter((fourberie, index, self) =>
              index === self.findIndex((d) => (
                d.fourberieRef === fourberie.fourberieRef
              ))
            )

            return personnage;

          }

        }

      });

    } else {
      return personnage;
    }

  }

  private async _getAllAptitudes(personnage: IPersonnage): Promise<IPersonnage> {

    // Aptitudes Racial
    if (personnage.race && personnage.race.aptitudesRacialRef && personnage.race.aptitudesRacialRef.length > 0) {
      personnage.race.aptitudesRacialRef.forEach(aptitudeRef => {
        let aptitudeItem: AptitudeItem = new AptitudeItem();
        aptitudeItem.aptitudeRef = aptitudeRef;
        personnage.aptitudes.push(aptitudeItem);
      })
    };

    // Aptitudes Classes
    if (personnage.classes && personnage.classes.length > 0) {
      personnage.classes.forEach(classeItem => {
        if (classeItem.classe.aptitudes && classeItem.classe.aptitudes.length > 0) {
          classeItem.classe.aptitudes.forEach(aptitudeItem => {
            if (classeItem.niveau >= aptitudeItem.niveauObtention) {
              personnage.aptitudes.push(aptitudeItem);
            }
          })
        }
      });
    }

    // Aptitudes Domaines
    if (personnage.domaines && personnage.domaines.length > 0) {
      personnage.domaines.forEach(domaine => {
        if (domaine.aptitudes && domaine.aptitudes.length > 0) {
          domaine.aptitudes.forEach(aptitudeItem => {
            personnage.classes.forEach(classe => {
              if (classe.classeRef == 'fNqknNgq0QmHzUaYEvEd' && classe.niveau >= aptitudeItem.niveauObtention) {
                personnage.aptitudes.push(aptitudeItem);
              }
            })
          })
        }
      });
    }

    // Aptitudes Esprit
    if (personnage.esprit && personnage.esprit.aptitudes && personnage.esprit.aptitudes.length > 0) {
      personnage.esprit.aptitudes.forEach(aptitudeItem => {
        personnage.classes.forEach(classe => {
          if (classe.classeRef == 'wW48swrqmr77awfyADMX' && classe.niveau >= aptitudeItem.niveauObtention) {
            personnage.aptitudes.push(aptitudeItem);
          }
        })
      })
    };

    // Remplis la liste de aptitudes complète
    let count: number = 0;
    if (!personnage.aptitudes) personnage.aptitudes = [];

    if (personnage.aptitudes && personnage.aptitudes.length > 0) {

      personnage.aptitudes.forEach(async (aptitudeItem) => {

        if (!aptitudeItem.aptitude) {
          const aptitude = await this.aptitudeService.getAptitude(aptitudeItem.aptitudeRef);
          aptitudeItem.aptitude = aptitude;
          count++;
          if (count == personnage.aptitudes.length) {

            // Filter Duplicates
            personnage.aptitudes = personnage.aptitudes.filter((aptitude, index, self) =>
              index === self.findIndex((d) => (
                d.aptitudeRef === aptitude.aptitudeRef
              ))
            )

            return personnage;

          }

        } else {

          count++;
          if (count == personnage.aptitudes.length) {

            // Filter Duplicates
            personnage.aptitudes = personnage.aptitudes.filter((aptitude, index, self) =>
              index === self.findIndex((d) => (
                d.aptitudeRef === aptitude.aptitudeRef
              ))
            )

            return personnage;

          }
        }

      });

    } else {
      return personnage;
    }

  }

  private async _getAllSorts(personnage: IPersonnage): Promise<IPersonnage> {

    // Sorts Classes
    if (personnage.classes && personnage.classes.length > 0) {
      personnage.classes.forEach(classeItem => {
        if (classeItem.classe.sorts && classeItem.classe.sorts.length > 0) {
          classeItem.classe.sorts.forEach(sortItem => {
            if (classeItem.niveau >= sortItem.niveauObtention) {
              personnage.sorts.push(sortItem);
            }
          })
        }
      });
    }

    // Sorts Domaines
    if (personnage.domaines && personnage.domaines.length > 0) {
      personnage.domaines.forEach(domaine => {
        if (domaine.sorts && domaine.sorts.length > 0) {
          domaine.sorts.forEach(sortItem => {
            personnage.classes.forEach(classe => {
              if (classe.classeRef == 'fNqknNgq0QmHzUaYEvEd' && classe.niveau >= sortItem.niveauObtention) {
                personnage.sorts.push(sortItem);
              }
            })
          })
        }
      });
    }

    // Sorts Esprit
    if (personnage.esprit && personnage.esprit.sorts && personnage.esprit.sorts.length > 0) {
      personnage.esprit.sorts.forEach(sortItem => {
        personnage.classes.forEach(classe => {
          if (classe.classeRef == 'wW48swrqmr77awfyADMX' && classe.niveau >= sortItem.niveauObtention) {
            personnage.sorts.push(sortItem);
          }
        })
      })
    };

    // Sorts Aptitudes (Équivalence)
    if (personnage.aptitudes && personnage.aptitudes.length > 0) {
      personnage.aptitudes.forEach(aptitudeItem => {
        if (aptitudeItem.aptitude.sortsEquivalentRef && aptitudeItem.aptitude.sortsEquivalentRef.length > 0) {
          aptitudeItem.aptitude.sortsEquivalentRef.forEach(aptSortRef => {
            let sortItem: SortItem = new SortItem();
            sortItem.niveauObtention = aptitudeItem.niveauObtention;
            sortItem.sortRef = aptSortRef;
            personnage.sorts.push(sortItem);
          });
        }
      })
    }

    // Remplis la liste de sorts complète
    let count = 0;
    if (!personnage.sorts) personnage.sorts = [];
    if (personnage.sorts && personnage.sorts.length > 0) {
      personnage.sorts.forEach(async (sortItem: SortItem) => {

        if (!sortItem.sort) { //Avoid fetching Sort if already fetch
          sortItem.sort = await this.sortService.getSort(sortItem.sortRef);
          count++;
          if (count == personnage.sorts.length) {

            // Filter duplicated
            personnage.sorts = personnage.sorts.filter((sort, index, self) =>
              index === self.findIndex((d) => (
                d.sortRef === sort.sortRef
              ))
            )

            return personnage;
          }
        } else {
          count++;
          if (count == personnage.sorts.length) {

            personnage.sorts = personnage.sorts.filter((sort, index, self) =>
              index === self.findIndex((d) => (
                d.sortRef === sort.sortRef
              ))
            )

            return personnage;
          }
        }

      });
    } else {
      return personnage;
    }
  }

  private async getAllDons(personnage: IPersonnage): Promise<IPersonnage> {

    // Dons Racial
    if (personnage.race && personnage.race.donsRacialRef && personnage.race.donsRacialRef.length > 0) {
      personnage.race.donsRacialRef.forEach(donRef => {
        let donItem: DonItem = new DonItem();
        donItem.donRef = donRef;
        personnage.dons.push(donItem);
      })
    }

    // Dons Classes
    if (personnage.classes && personnage.classes.length > 0) {
      personnage.classes.forEach(classeItem => {
        if (classeItem.classe.dons && classeItem.classe.dons.length > 0) {
          classeItem.classe.dons.forEach(donItem => {
            if (classeItem.niveau >= donItem.niveauObtention) {
              personnage.dons.push(donItem);
            }
          })
        }
      });
    }

    // Dons Domaines
    if (personnage.domaines && personnage.domaines.length > 0) {
      personnage.domaines.forEach(domaine => {
        if (domaine.dons && domaine.dons.length > 0) {
          domaine.dons.forEach(donItem => {
            personnage.classes.forEach(classe => {
              if (classe.classeRef == 'fNqknNgq0QmHzUaYEvEd' && classe.niveau >= donItem.niveauObtention) {
                personnage.dons.push(donItem);
              }
            })
          })
        }
      });
    }

    // Dons Esprit
    if (personnage.esprit && personnage.esprit.dons && personnage.esprit.dons.length > 0) {
      personnage.esprit.dons.forEach(donItem => {
        personnage.classes.forEach(classe => {
          if (classe.classeRef == 'wW48swrqmr77awfyADMX' && classe.niveau >= donItem.niveauObtention) {
            personnage.dons.push(donItem);
          }
        })
      })
    };

    // Dons Fourberies (Équivalence)
    if (personnage.fourberies && personnage.fourberies.length > 0) {
      personnage.fourberies.forEach(fourberie => {
        if (fourberie.fourberie && fourberie.fourberie.donsEquivalentRef && fourberie.fourberie.donsEquivalentRef.length > 0) {
          fourberie.fourberie.donsEquivalentRef.forEach(aptDonRef => {
            let donItem = new DonItem();
            donItem.niveauObtention = fourberie.niveauObtention;
            donItem.donRef = aptDonRef;
            personnage.dons.push(donItem);
          });
        }
      })
    }

    // Dons Aptitudes (Équivalence)
    if (personnage.aptitudes && personnage.aptitudes.length > 0) {
      personnage.aptitudes.forEach(aptitude => {
        if (aptitude.aptitude.donsEquivalentRef && aptitude.aptitude.donsEquivalentRef.length > 0) {
          aptitude.aptitude.donsEquivalentRef.forEach(aptDonRef => {
            let donItem = new DonItem();
            donItem.niveauObtention = aptitude.niveauObtention;
            donItem.donRef = aptDonRef;
            personnage.dons.push(donItem);
          });
        }
      })
    }

    // Remplis la liste de dons complète
    let count: number = 0;
    if (!personnage.dons) personnage.dons = [];

    if (personnage.dons && personnage.dons.length > 0) {

      personnage.dons.forEach(async (donItem) => {

        if (!donItem.don) { //Avoid fetching Don if already fetch
          const don = await this.donService.getDon(donItem.donRef, false, true);
          donItem.don = don;
          count++;
          if (count == personnage.dons.length) {

            // Filter duplicated
            personnage.dons = personnage.dons.filter((don, index, self) =>
              index === self.findIndex((d) => (
                d.donRef === don.donRef
              ))
            )

            return personnage;
          }

        } else {
          count++;
          if (count == personnage.dons.length) {

            // Filter duplicated
            personnage.dons = personnage.dons.filter((don, index, self) =>
              index === self.findIndex((d) => (
                d.donRef === don.donRef
              ))
            )

            return personnage;
          }
        }

      });

    } else {
      return personnage;
    }

  }

  private async _getStatistiquesParDefault(personnage: IPersonnage): Promise<IPersonnage> {

    const statistiques = await Promise.all([
      this.statistiqueService.getStatistique(StatistiqueIds.Constitution),
      this.statistiqueService.getStatistique(StatistiqueIds.Dextérité),
      this.statistiqueService.getStatistique(StatistiqueIds.Force),
      this.statistiqueService.getStatistique(StatistiqueIds.Intelligence),
      this.statistiqueService.getStatistique(StatistiqueIds.Sagesse),
      this.statistiqueService.getStatistique(StatistiqueIds.PVTorse),
      this.statistiqueService.getStatistique(StatistiqueIds.PVBras),
      this.statistiqueService.getStatistique(StatistiqueIds.PVJambes),
      this.statistiqueService.getStatistique(StatistiqueIds.Lutte),
      this.statistiqueService.getStatistique(StatistiqueIds.Mana),
    ]);

    // Constitution
    const constitution: StatistiqueValue = new StatistiqueValue();
    constitution.statistique = statistiques[0]; // MUST MATCH statistiques INDEX
    constitution.valeur = 0;
    personnage.statistiques.push(constitution);

    // Dexterite
    let dexterite: StatistiqueValue = new StatistiqueValue();
    dexterite.statistique = statistiques[1]; // MUST MATCH statistiques INDEX
    dexterite.valeur = 0;
    personnage.statistiques.push(dexterite);

    // Force
    let force: StatistiqueValue = new StatistiqueValue();
    force.statistique = statistiques[2]; // MUST MATCH statistiques INDEX
    force.valeur = 0;
    personnage.statistiques.push(force);

    // Intelligence
    let intelligence: StatistiqueValue = new StatistiqueValue();
    intelligence.statistique = statistiques[3]; // MUST MATCH statistiques INDEX
    intelligence.valeur = 0;
    personnage.statistiques.push(intelligence);

    // Sagesse
    let sagesse: StatistiqueValue = new StatistiqueValue();
    sagesse.statistique = statistiques[4]; // MUST MATCH statistiques INDEX
    sagesse.valeur = 0;
    personnage.statistiques.push(sagesse);

    // PV Torse
    let pvTorse: StatistiqueValue = new StatistiqueValue();
    pvTorse.statistique = statistiques[5]; // MUST MATCH statistiques INDEX
    pvTorse.valeur = 3;
    personnage.statistiques.push(pvTorse);

    // PV Bras
    let pvBras: StatistiqueValue = new StatistiqueValue();
    pvBras.statistique = statistiques[6]; // MUST MATCH statistiques INDEX
    pvBras.valeur = 2;
    personnage.statistiques.push(pvBras);

    // PV Jambes
    let pvJambes: StatistiqueValue = new StatistiqueValue();
    pvJambes.statistique = statistiques[7]; // MUST MATCH statistiques INDEX
    pvJambes.valeur = 2;
    personnage.statistiques.push(pvJambes);

    // Lutte
    let lutte: StatistiqueValue = new StatistiqueValue();
    lutte.statistique = statistiques[8]; // MUST MATCH statistiques INDEX
    lutte.valeur = 3;
    personnage.statistiques.push(lutte);

    // Mana
    let mana: StatistiqueValue = new StatistiqueValue();
    mana.statistique = statistiques[9]; // MUST MATCH statistiques INDEX
    mana.valeur = 0;
    personnage.statistiques.push(mana);

    return personnage;

  }

  private async _getStatistiques(personnage: IPersonnage): Promise<IPersonnage> {

    //Race Statistiques
    if (personnage.race.statistiques) {

      personnage.race.statistiques.forEach(statistiqueItem => {

        let found: boolean = false;

        if (personnage.statistiques) {
          personnage.statistiques.forEach(personnageStatistiqueItem => {
            if (statistiqueItem.statistiqueRef == personnageStatistiqueItem.statistique.id && personnage.niveauReel >= statistiqueItem.niveau) {

              //Cummulable l'ajoute à la valeur
              if (statistiqueItem.cummulable) {
                personnageStatistiqueItem.valeur += statistiqueItem.valeur;
              }

              //Non Cummulable prend la plus forte des deux
              if (!statistiqueItem.cummulable) {
                personnageStatistiqueItem.valeur = Math.max(personnageStatistiqueItem.valeur, statistiqueItem.valeur);
              }

              found = true;
            }
          })
        }

        if (!found && personnage.niveauReel >= statistiqueItem.niveau) {

          if (!personnage.statistiques) {
            personnage.statistiques = [];
          }

          let statistique: StatistiqueValue = new StatistiqueValue();
          statistique.statistique = statistiqueItem.statistique;
          statistique.valeur = statistiqueItem.valeur;
          personnage.statistiques.push(statistique);

        }

      })
    }

    //Classe Statistiques
    if (personnage.classes && personnage.classes.length > 0) {
      personnage.classes.forEach(classeItem => {

        if (classeItem.classe && classeItem.classe.statistiques) {
          classeItem.classe.statistiques.forEach(statistiqueItem => {

            let found: boolean = false;

            if (personnage.statistiques) {
              personnage.statistiques.forEach(personnageStatistiqueItem => {
                if (statistiqueItem.statistiqueRef == personnageStatistiqueItem.statistique.id && classeItem.niveau >= statistiqueItem.niveau) {

                  //Cummulable l'ajoute à la valeur
                  if (statistiqueItem.cummulable) {
                    personnageStatistiqueItem.valeur += statistiqueItem.valeur;
                  }

                  //Non Cummulable prend la plus forte des deux
                  if (!statistiqueItem.cummulable) {
                    personnageStatistiqueItem.valeur = Math.max(personnageStatistiqueItem.valeur, statistiqueItem.valeur);
                  }

                  found = true;
                }
              })
            }

            if (!found && personnage.niveauReel >= statistiqueItem.niveau) {

              if (!personnage.statistiques) {
                personnage.statistiques = [];
              }

              let statistique: StatistiqueValue = new StatistiqueValue();
              statistique.statistique = statistiqueItem.statistique;
              statistique.valeur = statistiqueItem.valeur;
              personnage.statistiques.push(statistique);

            }

          })
        }

      })

    }

    //Aptitude Statistiques
    if (personnage.aptitudes) {

      personnage.aptitudes.forEach(aptitudeItem => {
        aptitudeItem.aptitude.statistiques.forEach(aptitudeStatistiqueItem => {

          let found: boolean = false;

          if (personnage.statistiques) {
            personnage.statistiques.forEach(personnageStatistiqueItem => {

              // ... Manque potentiellement un attribue de classe dans les aptitutes spéciales pour faire le calcul du niveau selon la classe
              // ... Manque validation du niveau
              if (aptitudeStatistiqueItem.statistiqueRef == personnageStatistiqueItem.statistique.id) {

                //Cummulable l'ajoute à la valeur
                if (aptitudeStatistiqueItem.cummulable) {
                  personnageStatistiqueItem.valeur += aptitudeStatistiqueItem.valeur;
                }

                //Non Cummulable prend la plus forte des deux
                if (!aptitudeStatistiqueItem.cummulable) {
                  personnageStatistiqueItem.valeur = Math.max(personnageStatistiqueItem.valeur, aptitudeStatistiqueItem.valeur);
                }

                found = true;
              }
            })
          }

          if (!found) {

            if (!personnage.statistiques) {
              personnage.statistiques = [];
            }

            let statistique: StatistiqueValue = new StatistiqueValue();
            statistique.statistique = aptitudeStatistiqueItem.statistique;
            statistique.valeur = aptitudeStatistiqueItem.valeur;
            personnage.statistiques.push(statistique);

          }

        })

      })
    }

    //Don Statistiques
    if (personnage.dons) {

      personnage.dons.forEach(donItem => {
        donItem.don.statistiques.forEach(donStatistiqueItem => {

          let found: boolean = false;

          if (personnage.statistiques) {
            personnage.statistiques.forEach(personnageStatistiqueItem => {

              if (donStatistiqueItem.statistiqueRef == personnageStatistiqueItem.statistique.id) {

                //Cummulable l'ajoute à la valeur
                if (donStatistiqueItem.cummulable) {
                  personnageStatistiqueItem.valeur += donStatistiqueItem.valeur;
                }

                //Non Cummulable prend la plus forte des deux
                if (!donStatistiqueItem.cummulable) {
                  personnageStatistiqueItem.valeur = Math.max(personnageStatistiqueItem.valeur, donStatistiqueItem.valeur);
                }

                found = true;
              }
            })
          }

          if (!found) {

            if (!personnage.statistiques) {
              personnage.statistiques = [];
            }

            let statistique: StatistiqueValue = new StatistiqueValue();
            statistique.statistique = donStatistiqueItem.statistique;
            statistique.valeur = donStatistiqueItem.valeur;
            personnage.statistiques.push(statistique);

          }

        })

      })
    }

    let manaProfane: number = 0;
    let manaDivine: number = 0;

    //Modificateurs
    personnage.statistiques.forEach(statistiqueValue => {

      //Modificateur de Constitution
      if (statistiqueValue.statistique.id == StatistiqueIds.Constitution) {
        personnage.statistiques.forEach(statistiqueValueUpdate => {

          //Modificateur de point de vie
          if (
            statistiqueValueUpdate.statistique.id == StatistiqueIds.PVTorse ||
            statistiqueValueUpdate.statistique.id == StatistiqueIds.PVBras ||
            statistiqueValueUpdate.statistique.id == StatistiqueIds.PVJambes
          ) {
            statistiqueValueUpdate.valeur += statistiqueValue.valeur;
          }

        })
      }

      //Modificateur de Lutte
      if (statistiqueValue.statistique.id == StatistiqueIds.Force || statistiqueValue.statistique.id == StatistiqueIds.Dextérité) { //Force ou Dextérité
        personnage.statistiques.forEach(statistiqueValueUpdate => {

          //Modificateur de Lutte
          if (statistiqueValueUpdate.statistique.id == StatistiqueIds.Lutte) {
            statistiqueValueUpdate.valeur += statistiqueValue.valeur;
          }

        })
      }

      //Modificateur de Mana
      if (statistiqueValue.statistique.id == StatistiqueIds.Mana) {


        // Profane & Divin
        if (personnage.niveauProfane && personnage.niveauProfane > 0 && personnage.niveauProfane > personnage.race.ajustement) {
          manaProfane = statistiqueValue.valeur;
          manaProfane += personnage.niveauProfane;
          manaProfane += 4;
        }
        if (personnage.niveauDivin && personnage.niveauDivin > 0 && personnage.niveauDivin > personnage.race.ajustement) {
          manaDivine = statistiqueValue.valeur;
          manaDivine += personnage.niveauDivin;
          manaDivine += 4;
        }

        //Modificateurs
        if (manaProfane > 0 || manaDivine > 0) {
          personnage.statistiques.forEach(statistiqueValueUpdate => {

            //Intelligence
            if (statistiqueValueUpdate.statistique.id == StatistiqueIds.Intelligence) {

              manaProfane += statistiqueValueUpdate.valeur;

              if (statistiqueValueUpdate.valeur == 1) {
                manaProfane = Math.round((personnage.niveauProfane / 2) + manaProfane);
              }
              if (statistiqueValueUpdate.valeur > 1) {
                manaProfane = Math.round(((personnage.niveauProfane + 1) / 2) + manaProfane);
              }

            }

            //Sagesse
            if (statistiqueValueUpdate.statistique.id == StatistiqueIds.Sagesse) {
              manaDivine += statistiqueValueUpdate.valeur;

              if (statistiqueValueUpdate.valeur == 1) {
                manaDivine = Math.round((personnage.niveauDivin / 2) + manaDivine);
              }
              if (statistiqueValueUpdate.valeur > 1) {
                manaDivine = Math.round(((personnage.niveauDivin + 1) / 2) + manaDivine);
              }

            }

          })
        }

      }

    });

    //Correcteur de Statistiques
    personnage.statistiques.forEach(statistiqueValue => {

      //Correcteur de Points de vie
      if (
        statistiqueValue.statistique.id == StatistiqueIds.PVTorse ||
        statistiqueValue.statistique.id == StatistiqueIds.PVBras ||
        statistiqueValue.statistique.id == StatistiqueIds.PVJambes
      ) {
        if (statistiqueValue.valeur <= 0) {
          statistiqueValue.valeur = 1;
        }
      }

      //Correcteur de Lutte
      if (statistiqueValue.statistique.id == StatistiqueIds.Lutte) {
        if (statistiqueValue.valeur < 0) {
          statistiqueValue.valeur = 0;
        }
      }

      //Correcteur de Mana
      if (statistiqueValue.statistique.id == StatistiqueIds.Mana) {
        if (manaProfane >= manaDivine) {
          statistiqueValue.valeur = manaProfane;
        } else {
          statistiqueValue.valeur = manaDivine;
        }
      }

    });

    return personnage;

  }

  private async _getResistances(personnage: IPersonnage): Promise<IPersonnage> {

    //Race Resistances
    if (personnage.race.resistances) {

      personnage.race.resistances.forEach(resistanceItem => {

        let found: boolean = false;

        if (personnage.resistances && personnage.resistances.length > 0) {
          personnage.resistances.forEach(personnageResistanceItem => {
            if (resistanceItem.resistanceRef == personnageResistanceItem.resistance.id && personnage.niveauReel >= resistanceItem.niveau) {

              //Cummulable l'ajoute à la valeur
              if (resistanceItem.cummulable) {
                personnageResistanceItem.valeur += resistanceItem.valeur;
              }

              //Non Cummulable prend la plus forte des deux
              if (!resistanceItem.cummulable) {
                personnageResistanceItem.valeur = Math.max(personnageResistanceItem.valeur, resistanceItem.valeur);
              }

              found = true;
            }
          })
        }

        if (!found && personnage.niveauReel >= resistanceItem.niveau) {

          if (!personnage.resistances) {
            personnage.resistances = [];
          }

          let resistance: ResistanceValue = new ResistanceValue();
          resistance.resistance = resistanceItem.resistance;
          resistance.valeur = resistanceItem.valeur;
          personnage.resistances.push(resistance);

        }

      })
    }

    //Classe Resistances
    if (personnage.classes && personnage.classes.length > 0) {
      personnage.classes.forEach(classeItem => {

        if (classeItem.classe && classeItem.classe.resistances) {
          classeItem.classe.resistances.forEach(resistanceItem => {

            let found: boolean = false;

            if (personnage.resistances) {
              personnage.resistances.forEach(personnageResistanceItem => {
                if (resistanceItem.resistanceRef == personnageResistanceItem.resistance.id && classeItem.niveau >= resistanceItem.niveau) {

                  //Cummulable l'ajoute à la valeur
                  if (resistanceItem.cummulable) {
                    personnageResistanceItem.valeur += resistanceItem.valeur;
                  }

                  //Non Cummulable prend la plus forte des deux
                  if (!resistanceItem.cummulable) {
                    personnageResistanceItem.valeur = Math.max(personnageResistanceItem.valeur, resistanceItem.valeur);
                  }

                  found = true;
                }
              })
            }

            if (!found && personnage.niveauReel >= resistanceItem.niveau) {

              if (!personnage.resistances) {
                personnage.resistances = [];
              }

              let resistance: ResistanceValue = new ResistanceValue();
              resistance.resistance = resistanceItem.resistance;
              resistance.valeur = resistanceItem.valeur;
              personnage.resistances.push(resistance);

            }

          })
        }

      })

    }

    //Aptitude Resistances
    if (personnage.aptitudes) {

      personnage.aptitudes.forEach(aptitudeItem => {
        aptitudeItem.aptitude.resistances.forEach(aptitudeResistanceItem => {

          let found: boolean = false;

          if (personnage.resistances) {
            personnage.resistances.forEach(personnageResistanceItem => {

              if (aptitudeResistanceItem.resistanceRef == personnageResistanceItem.resistance.id) {

                //Cummulable l'ajoute à la valeur
                if (aptitudeResistanceItem.cummulable) {
                  personnageResistanceItem.valeur += aptitudeResistanceItem.valeur;
                }

                //Non Cummulable prend la plus forte des deux
                if (!aptitudeResistanceItem.cummulable) {
                  personnageResistanceItem.valeur = Math.max(personnageResistanceItem.valeur, aptitudeResistanceItem.valeur);
                }

                found = true;
              }
            })
          }

          if (!found) {

            if (!personnage.resistances) {
              personnage.resistances = [];
            }

            let resistance: ResistanceValue = new ResistanceValue();
            resistance.resistance = aptitudeResistanceItem.resistance;
            resistance.valeur = aptitudeResistanceItem.valeur;
            personnage.resistances.push(resistance);

          }

        })

      })
    }

    //Don Resistances
    if (personnage.dons) {

      personnage.dons.forEach(donItem => {
        donItem.don.resistances.forEach(donResistanceItem => {

          let found: boolean = false;

          if (personnage.resistances) {
            personnage.resistances.forEach(personnageResistanceItem => {

              if (donResistanceItem.resistanceRef == personnageResistanceItem.resistance.id) {

                //Cummulable l'ajoute à la valeur
                if (donResistanceItem.cummulable) {
                  personnageResistanceItem.valeur += donResistanceItem.valeur;
                }

                //Non Cummulable prend la plus forte des deux
                if (!donResistanceItem.cummulable) {
                  personnageResistanceItem.valeur = Math.max(personnageResistanceItem.valeur, donResistanceItem.valeur);
                }

                found = true;
              }
            })
          }

          if (!found) {

            if (!personnage.resistances) {
              personnage.resistances = [];
            }

            let resistance: ResistanceValue = new ResistanceValue();
            resistance.resistance = donResistanceItem.resistance;
            resistance.valeur = donResistanceItem.valeur;
            personnage.resistances.push(resistance);

          }

        })

      })
    }

    return personnage;

  }

  private async _getImmunites(personnage: IPersonnage): Promise<IPersonnage> {

    if (!personnage.immunites) personnage.immunites = [];

    //Race Immunites
    if (personnage.race.immunites) {
      personnage.immunites = [...personnage.immunites, ...personnage.race.immunites];
    }

    //Classes Immunites
    if (personnage.classes && personnage.classes.length > 0) {
      personnage.classes.forEach(classeItem => {
        if (classeItem.classe.immunites) {
          personnage.immunites = [...personnage.immunites, ...classeItem.classe.immunites];
        }
      })
    }

    //Aptitudes Immunites
    if (personnage.aptitudes) {
      personnage.aptitudes.forEach(aptitudeItem => {
        if (aptitudeItem.aptitude && aptitudeItem.aptitude.immunites) {
          personnage.immunites = [...personnage.immunites, ...aptitudeItem.aptitude.immunites];
        }
      })
    }

    //Dons Immunites
    if (personnage.dons) {
      personnage.dons.forEach(donItem => {
        if (donItem.don && donItem.don.immunites) {
          personnage.immunites = [...personnage.immunites, ...donItem.don.immunites];
        }
      })
    }

    return personnage;

  }

  private async _getDonsNiveauEffectif(personnage: IPersonnage): Promise<IPersonnage> {

    if (personnage.dons && personnage.statistiques) {
      personnage.dons.forEach(donItem => {

        if (donItem.don.afficherNiveau) {

          //Niveau Effectif du Personnage et Niveau d'Obtention
          donItem.niveauEffectif = personnage.niveauEffectif - (donItem.niveauObtention - 1);

          //Modificateur de Statistique
          if (donItem.don.modificateurs && donItem.don.modificateurs.length > 0) {
            donItem.don.modificateurs.forEach(modificateur => {
              personnage.statistiques.forEach(statistiqueValue => {
                if (statistiqueValue.statistique.id == modificateur.id) {
                  donItem.niveauEffectif += statistiqueValue.valeur;
                }
              });
            })
          }

        }

      })
    }

    // Remplis la liste de dons complète
    return personnage;

  }

  private async _getCapaciteSpeciales(personnage: IPersonnage): Promise<IPersonnage> {

    if (!personnage.capaciteSpeciales) personnage.capaciteSpeciales = [];
    personnage.statistiques.forEach(statistiqueValue => {
      let found: boolean = false;
      Object.values(StatistiqueIds).forEach((statistiqueId) => {
        if (statistiqueId == statistiqueValue.statistique.id) {
          found = true;
        }
      })
      if (!found) {
        personnage.capaciteSpeciales.push(statistiqueValue);
      }
    })

    return personnage;

  }

}