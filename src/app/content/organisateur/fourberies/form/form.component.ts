import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { DonService, IDon } from '../../../../services/don.service';
import { FourberieService, IFourberie } from '../../../../services/fourberie.service';
import { StatistiqueService, IStatistique } from '../../../../services/statistique.service';

@Component({
  selector: 'app-organisateur-fourberies-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class OrganisateurFourberiesFormComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private donService: DonService,
    private fourberieService: FourberieService,
    private statistiqueService: StatistiqueService,
    private router: Router
  ) { }

  id: string;
  dons: IDon[]
  fourberie = {} as IFourberie;
  fourberies: IFourberie[];
  statistiques: IStatistique[];

  ngOnInit() {
    this._getFourberie();
    this._getFourberies();
    this._getDons();
    this._getStatistiques();
  }

  private _getFourberie(): void {
    this.activatedRoute.params.subscribe(async (params: Params) => {
      if (params['id']) {
        this.id = params['id'];
        this.fourberie = await this.fourberieService.getFourberie(this.id);
      }
    });
  }

  private async _getDons(): Promise<void> {
    this.dons =  await this.donService.getDons();
  }

  private async _getFourberies(): Promise<void> {
    this.fourberies = await this.fourberieService.getFourberies();
  }

  private async _getStatistiques(): Promise<void> {
    this.statistiques = await this.statistiqueService.getStatistiques();
  }

  public async submit(): Promise<void> {
    if (this.id) {
      if (await this.fourberieService.updateFourberie(this.fourberie)) {
        this.router.navigate(["/organisateur/fourberies/list"]);
      }
    } else {
      if (await this.fourberieService.addFourberie(this.fourberie)) {
        this.router.navigate(["/organisateur/fourberies/list"]);
      }
    }
  }

}