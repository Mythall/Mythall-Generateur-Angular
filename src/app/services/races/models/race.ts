import { Classe } from "../../classes/models/classe";
import { Don } from "../../dons/models/don";
import { Aptitude } from "../../aptitudes/models/aptitude";
import { IAlignement } from "../../../services/alignement.service";
import { ISort } from "../../sort.service";
import { IImmunite } from "../../immunite.service";
import { ResistanceItem } from "../../resistance.service";
import { StatistiqueItem } from "../../statistique.service";

export class Race {

    constructor() {
        this.classesDisponible = [];
        this.alignementPermis = [];   
        this.ajustement = 0;
        this.statistiques = [];
        this.resistances = [];
        this.immunites = [];
        this.sortsRacial = [];
        this.donsRacial = [];
    }

    id: string;
    nom: string;
    description: string;
    obligations: string;
    avantages: string;
    desavantages: string;
    alignementPermis: IAlignement[];
    alignementPermisRef: string[];
    classesDisponible: Classe[];
    classesDisponibleRef: string[];
    ajustement: number;
    statistiques: StatistiqueItem[];
    resistances: ResistanceItem[];
    immunites: IImmunite[];
    immunitesRef: string[];
    sortsRacial: ISort[];
    sortsRacialRef: string[];
    donsRacial: Don[];
    donsRacialRef: string[];
    aptitudesRacial: Aptitude[];
    aptitudesRacialRef: string[];


    saveState(): any {

        if(!this.resistances) this.resistances = [];
        if(!this.statistiques) this.statistiques = [];
        if(!this.immunitesRef) this.immunitesRef = [];
        if(!this.sortsRacialRef) this.sortsRacialRef = [];
        if(!this.donsRacialRef) this.donsRacialRef = [];
        if(!this.aptitudesRacialRef) this.aptitudesRacialRef = [];

        //Filter Out
        this.resistances.forEach(resistance => {
            resistance.resistance = null;
        });
        this.statistiques.forEach(statistique => {
            statistique.statistique = null;
        });

        var race: any = {
            nom: this.nom,
            description: this.description,
            obligations: this.obligations,
            avantages: this.avantages,
            desavantages: this.desavantages,
            alignementPermisRef: this.alignementPermisRef,
            classesDisponibleRef: this.classesDisponibleRef,
            ajustement: this.ajustement,
            statistiques: this.statistiques.map((obj)=> {return Object.assign({}, obj)}),
            resistances: this.resistances.map((obj)=> {return Object.assign({}, obj)}),
            immunitesRef: this.immunitesRef,
            sortsRacialRef: this.sortsRacialRef,
            donsRacialRef: this.donsRacialRef,
            aptitudesRacialRef: this.aptitudesRacialRef
        };

        console.log(race);
        return race;
    }

}