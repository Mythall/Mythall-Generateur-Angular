import { ClasseItem } from "../../classes/models/classe";
import { Race } from "../../races/models/race";
import { User } from "../../@core/models/user";
import { Esprit } from "../../esprits/models/esprit";
import { IDieu } from "../../../services/dieu.service";
import { IAlignement } from "../../alignement.service";
import { Domaine } from "../../domaines/models/domaine";
import { IEcole } from "../../ecole.service";
import { SortItem } from "../../sort.service";
import { IImmunite } from "../../immunite.service";
import { ResistanceValue } from "../../resistance.service";
import { StatistiqueValue } from "../../statistique.service";
import { FourberieItem } from "../../fourberie.service";
import { IOrdre } from "../../ordre.service";
import { AptitudeItem } from "../../aptitude.service";
import { DonItem } from "../../don.service";

export class Personnage {

    constructor() {
        this.classes = [];
        this.dons = [];
        this.aptitudes = [];
        this.sorts = [];
        this.fourberies = [];
        this.resistances = [];
        this.statistiques = [];
        this.capaciteSpeciales = [];
        this.ordres = [];
        this.domaines = [];
        this.vie = 5;
        this.gnEffectif = 1;
        this.niveauDisponible = 0;
    }

    id: string;
    nom: string;
    user: User;
    userRef: string;
    classes: ClasseItem[];
    alignement: IAlignement;
    alignementRef: string;
    dons: DonItem[];
    aptitudes: AptitudeItem[];
    sorts: SortItem[];
    fourberies: FourberieItem[];
    race: Race;
    raceRef: string;
    niveauEffectif: number;
    niveauReel: number;
    niveauProfane: number;
    niveauDivin: number;
    niveauDisponible: number;
    gnEffectif: number;
    statistiques: StatistiqueValue[];
    capaciteSpeciales: StatistiqueValue[]; //Display Only, not saved
    resistances: ResistanceValue[];
    immunites: IImmunite[];
    esprit: Esprit;
    espritRef: string;
    ecole: IEcole;
    ecoleRef: string;
    dieu: IDieu;
    dieuRef: string;
    ordres: IOrdre[];
    ordresRef: string[];
    domaines: Domaine[];
    domainesRef: string[];
    vie: number;

    saveState(): any {

        if (!this.dieuRef) this.dieuRef = '';
        if (!this.ecoleRef) this.ecoleRef = '';
        if (!this.espritRef) this.espritRef = '';
        if (!this.ordresRef) this.ordresRef = [];
        if (!this.domainesRef) this.domainesRef = [];

        // Filter Out Race Dons / Sorts / Fourberies / Aptitudes
        if (this.race) {

            // Race
            if (this.dons && this.dons.length > 0) {
                let donsTemporaire: DonItem[] = [];
                this.dons.forEach(don => {
                    let found: boolean = false;
                    this.race.donsRacialRef.forEach(id => {
                        if (id == don.donRef) {
                            found = true;
                        }
                    });

                    if (!found) {
                        donsTemporaire.push(don);
                    }

                });
                this.dons = donsTemporaire;
            }

            // Sorts
            if (this.sorts && this.sorts.length > 0) {
                let sortsTemporaire: SortItem[] = [];
                this.sorts.forEach(sort => {
                    let found: boolean = false;
                    this.race.sortsRacialRef.forEach(id => {
                        if (id == sort.sortRef) {
                            found = true;
                        }
                    });

                    if (!found) {
                        sortsTemporaire.push(sort);
                    }

                });
                this.sorts = sortsTemporaire;
            }

            // Aptitudes
            if (this.aptitudes && this.aptitudes.length > 0) {
                let aptitudesTemporaire: AptitudeItem[] = [];
                this.aptitudes.forEach(aptitude => {
                    let found: boolean = false;
                    this.race.aptitudesRacialRef.forEach(id => {
                        if (id == aptitude.aptitudeRef) {
                            found = true;
                        }
                    });

                    if (!found) {
                        aptitudesTemporaire.push(aptitude);
                    }

                });
                this.aptitudes = aptitudesTemporaire;
            }

        }

        // Filter Out Classe Dons / Sorts / Fourberies / Aptitudes
        // if (this.classes) {
        //     this.classes.forEach(classeItem => {

        //         // Dons
        //         if (this.dons && this.dons.length > 0) {
        //             let donsTemporaire: DonItem[] = [];
        //             this.dons.forEach(don => {
        //                 let found: boolean = false;
        //                 if (classeItem.classe && classeItem.classe.dons && classeItem.classe.dons.length > 0) {
        //                     classeItem.classe.dons.forEach(classeDon => {
        //                         if (classeDon.donRef == don.donRef) {
        //                             found = true;
        //                         }
        //                     });
        //                 }

        //                 if (!found) {
        //                     donsTemporaire.push(don);
        //                 }

        //             });
        //             this.dons = donsTemporaire;
        //         }

        //         // Sorts
        //         if (this.sorts && this.sorts.length > 0) {
        //             let sortsTemporaire: SortItem[] = [];
        //             this.sorts.forEach(sort => {
        //                 let found: boolean = false;
        //                 if (classeItem.classe && classeItem.classe.sorts && classeItem.classe.sorts.length > 0) {
        //                     classeItem.classe .sorts.forEach(classeSort => {
        //                         if (classeSort.sortRef == sort.sortRef) {
        //                             found = true;
        //                         }
        //                     });

        //                     if (!found) {
        //                         sortsTemporaire.push(sort);
        //                     }
        //                 }

        //             });
        //             this.sorts = sortsTemporaire;
        //         }

        //         // Aptitudes
        //         if (this.aptitudes && this.aptitudes.length > 0) {
        //             let aptitudesTemporaire: AptitudeItem[] = [];
        //             this.aptitudes.forEach(aptitude => {
        //                 let found: boolean = false;
        //                 if (classeItem.classe && classeItem.classe.aptitudes && classeItem.classe.aptitudes.length > 0) {
        //                     classeItem.classe.aptitudes.forEach(classeAptitude => {
        //                         if (classeAptitude.aptitudeRef == aptitude.aptitudeRef) {
        //                             found = true;
        //                         }
        //                     });

        //                     if (!found) {
        //                         aptitudesTemporaire.push(aptitude);
        //                     }
        //                 }

        //             });
        //             this.aptitudes = aptitudesTemporaire;
        //         }


        //     });
        // }

        //Filter Out Populated Objects
        this.classes.forEach(classeItem => {
            classeItem.classe = null;
        });
        this.dons.forEach(donItem => {
            donItem.don = null;
        });
        this.aptitudes.forEach(aptitudeItem => {
            aptitudeItem.aptitude = null;
        });
        this.sorts.forEach(sortItem => {
            sortItem.sort = null;
        });
        this.fourberies.forEach(fourberieItem => {
            fourberieItem.fourberie = null;
        });

        console.log(this);
        return {
            nom: this.nom,
            classes: this.classes.map((obj) => { return Object.assign({}, obj) }),
            alignementRef: this.alignementRef,
            dons: this.dons.map((obj) => { return Object.assign({}, obj) }),
            aptitudes: this.aptitudes.map((obj) => { return Object.assign({}, obj) }),
            sorts: this.sorts.map((obj) => { return Object.assign({}, obj) }),
            fourberies: this.fourberies.map((obj) => { return Object.assign({}, obj) }),
            raceRef: this.raceRef,
            userRef: this.userRef,
            ecoleRef: this.ecoleRef,
            espritRef: this.espritRef,
            dieuRef: this.dieuRef,
            ordresRef: this.ordresRef,
            domainesRef: this.domainesRef,
            vie: this.vie,
            gnEffectif: this.gnEffectif
        }
    }

}