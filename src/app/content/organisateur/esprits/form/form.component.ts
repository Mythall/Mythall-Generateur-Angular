import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AptitudeService, IAptitude, AptitudeItem } from '../../../../services/aptitude.service';
import { DonService, IDon, DonItem } from '../../../../services/don.service';
import { EspritService, IEsprit } from '../../../../services/esprit.service';
import { SortService, ISort, SortItem } from '../../../../services/sort.service';

@Component({
  selector: 'app-organisateur-esprits-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class OrganisateurEspritsFormComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private aptitudeService: AptitudeService,
    private donService: DonService,
    private espritService: EspritService,
    private sortService: SortService,
    private router: Router
  ) { }

  id: string;
  esprit = {} as IEsprit;
  aptitudes: IAptitude[];
  dons: IDon[];
  sorts: ISort[];

  ngOnInit() {
    this._getEsprit();
    this._getAptitudes();
    this._getDons();
    this._getSorts();
  }

  private _getEsprit(): void {
    this.activatedRoute.params.subscribe(async (params: Params) => {
      if (params['id']) {
        this.id = params['id'];
        this.esprit = await this.espritService.getEsprit(this.id);
      }
    });
  }

  private async _getAptitudes(): Promise<void> {
    this.aptitudes = await this.aptitudeService.getAptitudes();
  }

  private async _getDons(): Promise<void> {
    this.dons = await this.donService.getDons();
  }

  private async _getSorts(): Promise<void> {
    this.sorts = await this.sortService.getSorts();
  }

  public async submit(): Promise<void> {
    if (this.id) {
      const result = await this.espritService.updateEsprit(this.esprit);
      if (result) {
        this.router.navigate(["/organisateur/esprits/list"]);
      }
    } else {
      const result = await this.espritService.addEsprit(this.esprit);
      if (result) {
        this.router.navigate(["/organisateur/esprits/list"]);
      }
    }
  }

  public addAptitude(): void {
    if (!this.esprit.aptitudes) this.esprit.aptitudes = [];
    this.esprit.aptitudes.push(new AptitudeItem());
  }

  public deleteAptitude(index: number): void {
    this.esprit.aptitudes.splice(index, 1);
  }

  public addDon(): void {
    if (!this.esprit.dons) this.esprit.dons = [];
    this.esprit.dons.push(new DonItem());
  }

  public deleteDon(index: number): void {
    this.esprit.dons.splice(index, 1);
  }

  public addSort(): void {
    if (!this.esprit.sorts) this.esprit.sorts = [];
    this.esprit.sorts.push(new SortItem());
  }

  public deleteSort(index: number): void {
    this.esprit.sorts.splice(index, 1);
  }

}