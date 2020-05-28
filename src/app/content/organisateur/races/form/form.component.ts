import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { RaceService, IRace } from '../../../../services/race.service';
import { ClasseService, IClasse } from '../../../../services/classe.service';
import { DonService, IDon } from '../../../../services/don.service';
import { ImmuniteService, IImmunite } from '../../../../services/immunite.service';
import { ResistanceService, IResistance, ResistanceItem } from '../../../../services/resistance.service';
import { StatistiqueService, IStatistique, StatistiqueItem } from '../../../../services/statistique.service';
import { SortService, ISort } from '../../../../services/sort.service';
import { AptitudeService, IAptitude } from '../../../../services/aptitude.service';
import { IAlignement, AlignementService } from '../../../../services/alignement.service';

@Component({
  selector: 'app-organisateur-races-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class OrganisateurRacesFormComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private classeService: ClasseService,
    private alignementService: AlignementService,
    private aptitudeService: AptitudeService,
    private donService: DonService,
    private raceService: RaceService,
    private immuniteService: ImmuniteService,
    private resistanceService: ResistanceService,
    private statistiqueService: StatistiqueService,
    private sortService: SortService,
    private router: Router
  ) { }

  id: string;
  race = {} as IRace;
  classes: IClasse[];
  alignements: IAlignement[];
  aptitudes: IAptitude[];
  dons: IDon[];
  resistances: IResistance[];
  statistiques: IStatistique[];
  immunites: IImmunite[];
  sorts: ISort[];

  ngOnInit() {
    this._getRace();
    this._getAlignements();
    this._getClasses();
    this._getAptitudes();
    this._getDons();
    this._getResistances();
    this._getStatistiques();
    this._getImmunites();
    this._getSorts();
  }

  private _getRace(): void {
    this.activatedRoute.params.subscribe(async (params: Params) => {
      if (params['id']) {
        this.id = params['id'];
        this.race = await this.raceService.getRace(this.id);
      }
    });
  }

  private async _getAlignements(): Promise<void> {
    this.alignements = await this.alignementService.getAlignements();
  }

  private async _getClasses(): Promise<void> {
    this.classes = await this.classeService.getClasses();
  }

  private async _getAptitudes(): Promise<void> {
    this.aptitudes = await this.aptitudeService.getAptitudes();
  }

  private async _getDons(): Promise<void> {
    this.dons = await this.donService.getDons();
  }

  private async _getResistances(): Promise<void> {
    this.resistances = await this.resistanceService.getResistances();
  }

  private async _getStatistiques(): Promise<void> {
    this.statistiques = await this.statistiqueService.getStatistiques();
  }

  private async _getImmunites(): Promise<void> {
    this.immunites = await this.immuniteService.getImmunites();
  }

  private async _getSorts(): Promise<void> {
    this.sorts = await this.sortService.getSorts();
  }

  public async submit(): Promise<void> {
    if (this.id) {
      const result = await this.raceService.updateRace(this.race);
      if (result) {
        this.router.navigate(["/organisateur/races/list"]);
      }
    } else {
      const result = await this.raceService.addRace(this.race);
      if (result) {
        this.router.navigate(["/organisateur/races/list"]);
      }
    }
  }

  public addResistance(): void {
    if (!this.race.resistances) this.race.resistances = [];
    this.race.resistances.push(new ResistanceItem());
  }

  public deleteResistance(index: number): void {
    this.race.resistances.splice(index, 1);
  }

  public addStatistique(): void {
    if (!this.race.statistiques) this.race.statistiques = [];
    this.race.statistiques.push(new StatistiqueItem());
  }

  public deleteStatistique(index: number): void {
    this.race.statistiques.splice(index, 1);
  }

}