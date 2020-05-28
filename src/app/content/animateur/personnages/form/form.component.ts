import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../../../../layout/dialogs/loading/loading.dialog.component';
import { AptitudeService, IAptitude, AptitudeItem } from '../../../../services/aptitude.service';
import { PersonnageService } from '../../../../services/personnages/personnage.service';
import { Personnage } from '../../../../services/personnages/models/personnage';
import { IAlignement, AlignementService } from '../../../../services/alignement.service';
import { ClasseService } from '../../../../services/classes/classe.service';
import { Classe, ClasseItem } from '../../../../services/classes/models/classe';
import { IDieu, DieuService } from '../../../../services/dieu.service';
import { DonService, IDon, DonItem } from '../../../../services/don.service';
import { EspritService } from '../../../../services/esprits/esprit-service';
import { Esprit } from '../../../../services/esprits/models/esprit';
import { RaceService } from '../../../../services/races/race.service';
import { Race } from '../../../../services/races/models/race';
import { SortService, ISort, SortItem } from '../../../../services/sort.service';
import { UserService } from '../../../../services/@core/user.service';
import { User } from '../../../../services/@core/models/user';
import { OrdreService, IOrdre } from '../../../../services/ordre.service';
import { FourberieService, IFourberie, FourberieItem } from '../../../../services/fourberie.service';
import { DomaineService } from '../../../../services/domaines/domaine-service';
import { Domaine } from '../../../../services/domaines/models/domaine';

@Component({
  selector: 'app-animateur-personnages-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class AnimateurPersonnagesFormComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private alignementService: AlignementService,
    private aptitudeService: AptitudeService,
    private classeService: ClasseService,
    private dieuService: DieuService,
    private domaineService: DomaineService,
    private donService: DonService,
    private espritService: EspritService,
    private fourberieService: FourberieService,
    private ordreService: OrdreService,
    private personnageService: PersonnageService,
    private raceService: RaceService,
    private sortService: SortService,
    private userService: UserService,
    private router: Router,
  ) { }

  id: string;
  personnage: Personnage = new Personnage();
  classes: Classe[];
  alignements: IAlignement[];
  aptitudes: IAptitude[];
  dieux: IDieu[];
  domaines: Domaine[];
  dons: IDon[];
  fourberies: IFourberie[];
  ordres: IOrdre[];
  races: Race[];
  sorts: ISort[];
  users: User[];
  esprits: Esprit[];

  ngOnInit() {
    this.getPersonnage();
    this.getClasses();
    this._getAlignements();
    this._getAptitudes();
    this.getDomaines();
    this._getDons();
    this._getDieux();
    this.getEsprits();
    this._getFourberies();
    this._getOrdres();
    this.getRaces();
    this._getSorts();
    this.getUsers();
  }

  getPersonnage() {
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params['id']) {
        this.id = params['id'];
        this.personnageService.getPersonnage(this.id).subscribe(response => {
          this.personnage = this.personnageService.mapDefault(response);
        })
      }
    });
  }

  getClasses() {
    this.classeService.getClasses().subscribe(response => {
      this.classes = response;
    });
  }

  private async _getAlignements(): Promise<void> {
    this.alignements = await this.alignementService.getAlignements();
  }

  private async _getAptitudes(): Promise<void> {
    this.aptitudes =  await this.aptitudeService.getAptitudes();
  }

  private async _getDieux(): Promise<void> {
    this.dieux = await this.dieuService.getDieux();
  }

  getDomaines() {
    this.domaineService.getDomaines().subscribe(response => {
      this.domaines = response;
    });
  }

  private async _getDons(): Promise<void> {
    this.dons = await this.donService.getDons();
  }

  getEsprits() {
    this.espritService.getEsprits().subscribe(response => {
      this.esprits = response;
    })
  }

  private async _getFourberies(): Promise<void> {
    this.fourberies = await this.fourberieService.getFourberies();
  }

  private async _getOrdres(): Promise<void> {
    this.ordres = await this.ordreService.getOrdres();
  }

  getRaces() {
    this.raceService.getRacesSummary().subscribe(response => {
      this.races = response;
    });
  }

  private async _getSorts(): Promise<void> {
    this.sorts = await this.sortService.getSorts();
  }

  getUsers() {
    this.userService.getUsers().subscribe(response => {
      this.users = response;
    });
  }

  submit() {
    this.dialog.open(LoadingDialogComponent);
    if (this.id) {
      this.personnageService.updatePersonnage(this.id, this.personnage.saveState()).then(result => {
        if (result) {
          this.router.navigate(["/animateur/personnages/list"]);
          this.dialog.closeAll();
        }
      });
    } else {
      this.personnageService.addPersonnage(this.personnage.saveState()).then(result => {
        if (result) {
          this.router.navigate(["/animateur/personnages/list"]);
          this.dialog.closeAll();
        }
      });
    }

  }

  addClasse() {
    this.personnage.classes.push(new ClasseItem());
  }

  deleteClasse(index: number) {
    this.personnage.classes.splice(index, 1);
  }

  public addDon(): void {
    this.personnage.dons.push(new DonItem());
  }

  public deleteDon(index: number): void {
    this.personnage.dons.splice(index, 1);
  }

  public addAptitude(): void {
    this.personnage.aptitudes.push(new AptitudeItem());
  }

  public deleteAptitude(index: number): void {
    this.personnage.aptitudes.splice(index, 1);
  }

  public addSort(): void {
    this.personnage.sorts.push(new SortItem());
  }

  public deleteSort(index: number): void {
    this.personnage.sorts.splice(index, 1);
  }

  public addFourberie(): void {
    this.personnage.fourberies.push(new FourberieItem());
  }

  public deleteFourberie(index: number): void {
    this.personnage.fourberies.splice(index, 1);
  }

}