// import { IEcole } from "../../../services/ecole.service";
// import { IPorte } from "../../../services/porte.service";
// import { IDuree } from "../../../services/duree.service";
// import { IZone } from "../../../services/zone.service";

// export class Sort{

//     constructor(){
//     }

//     id: string;
//     nom: string;
//     niveau: string;
//     incantation: string;
//     sommaire: string;
//     description: string;
//     ecole: IEcole;
//     ecoleRef: string;
//     porte: IPorte;
//     porteRef: string;
//     duree: IDuree;
//     dureeRef: string;
//     zone: IZone;
//     zoneRef: string;

//     saveState(): any{

//         var sort: any = {
//             nom: this.nom,
//             niveau: this.niveau,
//             incantation: this.incantation,
//             sommaire: this.sommaire,
//             description: this.description,
//             ecoleRef: this.ecoleRef,
//             porteRef: this.porteRef,
//             dureeRef: this.dureeRef,
//             zoneRef: this.zoneRef,
//         };

//         console.log(sort);
//         return sort;
//     }

// }

// export class SortItem {
//     constructor(){
//         this.sort = null;
//         this.sortRef = '';
//         this.niveauObtention = 1;
//     }

//     sort: Sort;
//     sortRef: string;
//     niveauObtention: number;
// }