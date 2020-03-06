export enum Alignements {
    loyalBon = 'Loyal Bon',
    neutreBon = 'Neutre Bon',
    chaotiqueBon = 'Chaotique Bon',
    loyalNeutre = 'Loyal Neutre',
    neutreNeutre = 'Neutre Stricte',
    chaotiqueNeutre = 'Chaotique Neutre',
    loyalMauvais = 'Loyal Mauvais',
    neutreMauvais = 'Neutre Mauvais',
    chaotiqueMauvais = 'Chaotique Mauvais',
}

export class Alignement {

    constructor() {}

    id: string;
    nom: string;

    map(data, id?) {
        id ? this.id = id : '';
        for (var key in data) {
            this[key] = data[key]
        }
    }

    saveState(): any {

        var alignement: any = {
            nom: this.nom
        };

        return Object.assign({}, alignement);
    }

}