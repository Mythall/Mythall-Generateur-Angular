import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AptitudeService, IAptitude, AptitudeItem } from '../../../../services/aptitude.service';
import { DonService, IDon, DonCategories, DonItem } from '../../../../services/don.service';
import { DomaineService } from '../../../../services/domaines/domaine-service';
import { SortService, ISort, SortItem } from '../../../../services/sort.service';
import { Domaine } from '../../../../services/domaines/models/domaine';
import { ClasseService } from '../../../../services/classes/classe.service';
import { Classe } from '../../../../services/classes/models/classe';
import { IAlignement, AlignementService } from '../../../../services/alignement.service';
import { ChoixTypes, Choix } from '../../../../services/personnages/models/choix';
import { FourberieService, IFourberie } from '../../../../services/fourberie.service';

@Component({
  selector: 'app-organisateur-domaines-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class OrganisateurDomainesFormComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private aptitudeService: AptitudeService,
    private alignementService: AlignementService,
    private classeService: ClasseService,
    private donService: DonService,
    private domaineService: DomaineService,
    private fourberieService: FourberieService,
    private sortService: SortService,
    private router: Router
  ) { }

  id: string;
  domaine: Domaine = new Domaine();
  domaines: Domaine[];
  classes: Classe[];
  alignements: IAlignement[];
  aptitudes: IAptitude[];
  dons: IDon[];
  sorts: ISort[];
  fourberies: IFourberie[];
  choix: string[] = ChoixTypes;
  categories: string[] = DonCategories;

  ngOnInit() {
    this.getDomaine();
    this.getDomaines();
    this._getAptitudes();
    this.getClasses();
    this._getAlignements();
    this._getDons();
    this._getSorts();
    this._getFourberies();
  }

  getDomaine() {
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params['id']) {
        this.id = params['id'];
        this.domaineService.getDomaine(this.id).subscribe(response => {
          this.domaine = response;
        });
      }
    });
  }

  getDomaines() {
    this.domaineService.getDomaines().subscribe(response => {
      this.domaines = response;
    })
  }

  getClasses() {
    this.classeService.getClasses().subscribe(response => {
      this.classes = response;
    })
  }

  private async _getAlignements(): Promise<void> {
    this.alignements = await this.alignementService.getAlignements();
  }

  private async _getAptitudes(): Promise<void> {
    this.aptitudes = await this.aptitudeService.getAptitudes();
  }

  private async _getFourberies(): Promise<void> {
    this.fourberies = await this.fourberieService.getFourberies();
  }

  private async _getDons(): Promise<void> {
    this.dons = await this.donService.getDons();
  }

  private async _getSorts(): Promise<void> {
    this.sorts = await this.sortService.getSorts();
  }

  public async submit(): Promise<void> {
    if (this.id) {
      const result = await this.domaineService.updateDomaine(this.domaine);
      if (result) {
        this.router.navigate(["/organisateur/domaines/list"]);
      }
    } else {
      const result = await this.domaineService.addDomaine(this.domaine);
      if (result) {
        this.router.navigate(["/organisateur/domaines/list"]);
      }
    }
  }

  public addAptitude(): void {
    if (!this.domaine.aptitudes) this.domaine.aptitudes = [];
    this.domaine.aptitudes.push(new AptitudeItem());
  }

  public deleteAptitude(index: number): void {
    this.domaine.aptitudes.splice(index, 1);
  }

  public addDon(): void {
    if (!this.domaine.dons) this.domaine.dons = [];
    this.domaine.dons.push(new DonItem());
  }

  public deleteDon(index: number): void {
    this.domaine.dons.splice(index, 1);
  }

  public addSort(): void {
    if (!this.domaine.sorts) this.domaine.sorts = [];
    this.domaine.sorts.push(new SortItem());
  }

  public deleteSort(index: number): void {
    this.domaine.sorts.splice(index, 1);
  }

  addChoix() {
    if (!this.domaine.choix) this.domaine.choix = [];
    const choix = new Choix();
    choix.domaine = true;
    this.domaine.choix.push(choix);
  }

  deleteChoix(index: number) {
    this.domaine.choix.splice(index, 1);
  }

  changeChoix(index: number) {
    delete this.domaine.choix[index].ref;
    delete this.domaine.choix[index].categorie;
  }

}