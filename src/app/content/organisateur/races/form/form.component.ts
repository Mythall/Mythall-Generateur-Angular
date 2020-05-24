import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { RaceService } from '../../../../services/races/race.service';
import { Race } from '../../../../services/races/models/race';
import { ClasseService } from '../../../../services/classes/classe.service';
import { DonService } from '../../../../services/dons/don.service';
import { ImmuniteService, IImmunite } from '../../../../services/immunite.service';
import { ResistanceService, IResistance, ResistanceItem }  from '../../../../services/resistance.service';
import { StatistiqueService, IStatistique, StatistiqueItem } from '../../../../services/statistique.service';
import { SortService, ISort } from '../../../../services/sort.service';
import { Classe } from '../../../../services/classes/models/classe';
import { Don } from '../../../../services/dons/models/don';
import { AptitudeService } from '../../../../services/aptitudes/aptitude.service';
import { Aptitude } from '../../../../services/aptitudes/models/aptitude';
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
  ){}

  id: string;
  race: Race = new Race();
  classes: Observable<Classe[]>;
  alignements: IAlignement[];
  aptitudes: Aptitude[];
  dons: Don[];
  resistances: IResistance[];
  statistiques: IStatistique[];
  immunites: IImmunite[];
  sorts: ISort[];

  ngOnInit() {
    this.getRace();
    this._getAlignements();
    this.getClasses();
    this.getAptitudes();
    this.getDons();
    this._getResistances();
    this._getStatistiques();
    this._getImmunites();
    this.getSorts();
  }

  getRace() {
    this.activatedRoute.params.subscribe((params: Params) => {
      if(params['id']){
        this.id = params['id'];
        this.raceService.getRace(this.id).subscribe(response => {
          this.race = response;
        });
      }
    });
  }

  private async _getAlignements(): Promise<void> {
    this.alignements =  await this.alignementService.getAlignements();
  }

  getClasses() {
    this.classes = this.classeService.getClasses();
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

  private async _getResistances(): Promise<void> {
    this.resistances =  await this.resistanceService.getResistances();
  }

  private async _getStatistiques(): Promise<void> {
    this.statistiques =  await this.statistiqueService.getStatistiques();
  }
  
  private async _getImmunites(): Promise<void> {
    this.immunites =  await this.immuniteService.getImmunites();
  }

  private async getSorts(): Promise<void>{
    this.sorts = await this.sortService.getSorts();
  }

  submit() {
    if(this.id){
      this.raceService.updateRace(this.id, this.race.saveState()).then(result => {
        if(result){
          this.router.navigate(["/organisateur/races/list"]);
        }
      });
    } else {
      this.raceService.addRace(this.race.saveState()).then(result => {
        if(result){
          this.router.navigate(["/organisateur/races/list"]);
        }
      });
    }    
  }

  addResistance(){
    if(!this.race.resistances) this.race.resistances = [];
    this.race.resistances.push(new ResistanceItem());
  }

  deleteResistance(index: number){
    this.race.resistances.splice(index, 1);
  }

  addStatistique(){
    if(!this.race.statistiques) this.race.statistiques = [];
    this.race.statistiques.push(new StatistiqueItem());
  }

  deleteStatistique(index: number){
    this.race.statistiques.splice(index, 1);
  }

}