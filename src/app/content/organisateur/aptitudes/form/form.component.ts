import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AptitudeService } from '../../../../services/aptitudes/aptitude.service';
import { DonService } from '../../../../services/dons/don.service';
import { ImmuniteService, IImmunite } from '../../../../services/immunite.service';
import { ResistanceService, IResistance, ResistanceItem } from '../../../../services/resistance.service';
import { StatistiqueService, IStatistique, StatistiqueItem } from '../../../../services/statistique.service';
import { Aptitude } from '../../../../services/aptitudes/models/aptitude';
import { Classe } from '../../../../services/classes/models/classe';
import { Don, DonCategories } from '../../../../services/dons/models/don';
import { Race } from '../../../../services/races/models/race';
import { SortService, ISort } from '../../../../services/sort.service';
import { Choix, ChoixTypes } from '../../../../services/personnages/models/choix';

@Component({
  selector: 'app-organisateur-aptitudes-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class OrganisateurAptitudesFormComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private donService: DonService,
    private aptitudeService: AptitudeService,
    private immuniteService: ImmuniteService,
    private resistanceService: ResistanceService,
    private sortService: SortService,
    private statistiqueService: StatistiqueService,
    private router: Router
  ) { }

  id: string;
  aptitude: Aptitude = new Aptitude();
  aptitudes: Aptitude[];
  classes: Classe[];
  dons: Don[];
  sorts: ISort[];
  races: Race[];
  resistances: IResistance[];
  statistiques: IStatistique[];
  immunites: IImmunite[];
  choix: string[] = ChoixTypes;
  categories: string[] = DonCategories;

  ngOnInit() {
    this.getAptitude();
    this.getAptitudes();
    this.getDons();
    this.getSorts();
    this._getImmunites();
    this._getResistances();
    this._getStatistiques();
  }

  getAptitude() {
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params['id']) {
        this.id = params['id'];
        this.aptitudeService.getAptitude(this.id).subscribe(response => {
          this.aptitude = response;
        });
      }
    });
  }

  getAptitudes() {
    this.aptitudeService.getAptitudes().subscribe(response => {
      this.aptitudes = response;
    })
  }

  getDons() {
    this.donService.getDons().subscribe(response => {
      this.dons = response;
    })
  }

  private async getSorts(): Promise<void> {
    this.sorts = await this.sortService.getSorts();
  }

  private async _getImmunites(): Promise<void> {
    this.immunites = await this.immuniteService.getImmunites();
  }

  private async _getResistances(): Promise<void> {
    this.resistances = await this.resistanceService.getResistances();
  }

  private async _getStatistiques(): Promise<void> {
    this.statistiques = await this.statistiqueService.getStatistiques();
  }

  public async submit(): Promise<void> {
    if (this.id) {
      const result = await this.aptitudeService.updateAptitude(this.id, this.aptitude.saveState());
      if (result) {
        this.router.navigate(["/organisateur/aptitudes/list"]);
      }
    } else {
      const result = await this.aptitudeService.addAptitude(this.aptitude.saveState());
      if (result) {
        this.router.navigate(["/organisateur/aptitudes/list"]);
      }
    }
  }

  addResistance() {
    if (!this.aptitude.resistances) this.aptitude.resistances = [];
    this.aptitude.resistances.push(new ResistanceItem());
  }

  deleteResistance(index: number) {
    this.aptitude.resistances.splice(index, 1);
  }

  addStatistique() {
    if (!this.aptitude.statistiques) this.aptitude.statistiques = [];
    this.aptitude.statistiques.push(new StatistiqueItem());
  }

  deleteStatistique(index: number) {
    this.aptitude.statistiques.splice(index, 1);
  }

  addChoix() {
    if (!this.aptitude.choix) this.aptitude.choix = [];
    this.aptitude.choix.push(new Choix());
  }

  deleteChoix(index: number) {
    this.aptitude.choix.splice(index, 1);
  }

}