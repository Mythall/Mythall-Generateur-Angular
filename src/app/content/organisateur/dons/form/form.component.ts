import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ClasseService, IClasse, ClasseAuthorise } from '../../../../services/classe.service';
import { DonService, IDon, DonCategories } from '../../../../services/don.service';
import { ImmuniteService, IImmunite } from '../../../../services/immunite.service';
import { RaceService, IRace } from '../../../../services/race.service';
import { ResistanceService, IResistance, ResistanceItem } from '../../../../services/resistance.service';
import { StatistiqueService, IStatistique, StatistiqueItem } from '../../../../services/statistique.service';

@Component({
  selector: 'app-organisateur-dons-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class OrganisateurDonsFormComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private classeService: ClasseService,
    private donService: DonService,
    private immuniteService: ImmuniteService,
    private raceService: RaceService,
    private resistanceService: ResistanceService,
    private statistiqueService: StatistiqueService,
    private router: Router
  ) { }

  id: string;
  don = {} as IDon;
  dons: IDon[];
  categories: string[] = DonCategories;
  classes: IClasse[];
  races: IRace[];
  resistances: IResistance[];
  statistiques: IStatistique[];
  immunites: IImmunite[];

  ngOnInit() {
    this._getDon();
    this._getDons();
    this._getClasses();
    this._getImmunites();
    this._getRaces();
    this._getResistances();
    this._getStatistiques();
  }

  private _getDon(): void {
    this.activatedRoute.params.subscribe(async (params: Params) => {
      if (params['id']) {
        this.id = params['id'];
        this.don = await this.donService.getDon(this.id);
      }
    });
  }

  private async _getDons(): Promise<void> {
    this.dons = await this.donService.getDons();
  }

  private async _getClasses(): Promise<void> {
    this.classes = await this.classeService.getClasses();
  }

  private async _getImmunites(): Promise<void> {
    this.immunites = await this.immuniteService.getImmunites();
  }

  private async _getRaces(): Promise<void> {
    this.races = await this.raceService.getRaces();
  }

  private async _getResistances(): Promise<void> {
    this.resistances = await this.resistanceService.getResistances();
  }

  private async _getStatistiques(): Promise<void> {
    this.statistiques = await this.statistiqueService.getStatistiques();
  }

  public async submit(): Promise<void> {
    if (this.id) {
      const result = await this.donService.updateDon(this.don);
      if (result) {
        this.router.navigate(["/organisateur/dons/list"]);
      }
    } else {
      const result = await this.donService.addDon(this.don);
      if (result) {
        this.router.navigate(["/organisateur/dons/list"]);
      }
    }
  }

  public addClasseAuthorise(): void {
    if (!this.don.classesAutorise) this.don.classesAutorise = [];
    this.don.classesAutorise.push(new ClasseAuthorise());
  }

  public deleteClasseAuthorise(index: number): void {
    this.don.classesAutorise.splice(index, 1);
  }

  public addResistance(): void {
    if (!this.don.resistances) this.don.resistances = [];
    this.don.resistances.push(new ResistanceItem());
  }

  public deleteResistance(index: number): void {
    this.don.resistances.splice(index, 1);
  }

  public addStatistique(): void {
    if (!this.don.statistiques) this.don.statistiques = [];
    this.don.statistiques.push(new StatistiqueItem());
  }

  public deleteStatistique(index: number): void {
    this.don.statistiques.splice(index, 1);
  }

  public selectAllRaces(): void {
    this.don.racesAutoriseRef = [];
    this.races.forEach(race => {
      this.don.racesAutoriseRef.push(race.id);
    })
  }

  public selectAllClasses(): void {
    this.don.classesAutorise = [];
    this.classes.forEach(classe => {
      const ca: ClasseAuthorise = new ClasseAuthorise();
      ca.classe = classe;
      ca.classeRef = classe.id;
      this.don.classesAutorise.push(ca);
    })
  }

}