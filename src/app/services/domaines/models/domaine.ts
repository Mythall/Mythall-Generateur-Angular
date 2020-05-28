import { Choix } from "../../personnages/models/choix";
import { IAlignement } from "../../../services/alignement.service";
import { Classe } from "../../classes/models/classe";
import { SortItem } from "../../sort.service";
import { AptitudeItem } from "../../aptitude.service";
import { DonItem } from "../../don.service";

export class Domaine {

    constructor() {
        this.alignementPermis = [];
        this.multiclassement = [];
        this.aptitudes = [];
        this.dons = [];
        this.sorts = [];
        this.choix = [];
    }

    id: string;
    nom: string;
    bonus: string;
    domaineContraire: Domaine;
    domaineContraireRef: string;
    alignementPermis: IAlignement[];
    alignementPermisRef: string[];
    multiclassement: Classe[];
    multiclassementRef: string[];
    aptitudes: AptitudeItem[];
    dons: DonItem[];
    sorts: SortItem[];
    choix: Choix[];

    saveState(): any {

        if (!this.aptitudes) this.aptitudes = [];
        if (!this.dons) this.dons = [];
        if (!this.sorts) this.sorts = [];
        if (!this.choix) this.choix = [];

        //Filter Out
        this.aptitudes.forEach(aptitude => {
            aptitude.aptitude = null;
        });

        this.dons.forEach(don => {
            don.don = null;
        });

        this.sorts.forEach(sort => {
            sort.sort = null;
        });

        var domaine: any = {
            nom: this.nom,
            bonus: this.bonus,
            domaineContraireRef: this.domaineContraireRef,
            alignementPermisRef: this.alignementPermisRef,
            multiclassementRef: this.multiclassementRef,
            aptitudes: this.aptitudes.map((obj) => { return Object.assign({}, obj) }),
            dons: this.dons.map((obj) => { return Object.assign({}, obj) }),
            sorts: this.sorts.map((obj) => { return Object.assign({}, obj) }),
            choix: this.choix.map((obj) => { return Object.assign({}, obj) }),
        };

        console.log(domaine);
        return domaine;
    }

}