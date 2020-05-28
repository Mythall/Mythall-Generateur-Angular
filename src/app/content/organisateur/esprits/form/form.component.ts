import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { AptitudeService, IAptitude, AptitudeItem } from '../../../../services/aptitude.service';
import { DonService, IDon, DonItem } from '../../../../services/don.service';
import { EspritService } from '../../../../services/esprits/esprit-service';
import { SortService, ISort, SortItem } from '../../../../services/sort.service';
import { Esprit } from '../../../../services/esprits/models/esprit';

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
  esprit: Esprit = new Esprit();
  aptitudes: IAptitude[];
  dons: IDon[];
  sorts: ISort[];

  ngOnInit() {
    this.getEsprit();
    this._getAptitudes();
    this._getDons();
    this._getSorts();
  }

  getEsprit() {
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params['id']) {
        this.id = params['id'];
        this.espritService.getEsprit(this.id).subscribe(response => {
          this.esprit = response;
        });
      }
    });
  }

  private async _getAptitudes(): Promise<void> {
    this.aptitudes =  await this.aptitudeService.getAptitudes();
  }

  private async _getDons(): Promise<void> {
    this.dons =  await this.donService.getDons();
  }

  private async _getSorts(): Promise<void> {
    this.sorts = await this.sortService.getSorts();
  }

  submit() {
    if (this.id) {
      this.espritService.updateEsprit(this.id, this.esprit.saveState()).then(result => {
        if (result) {
          this.router.navigate(["/organisateur/esprits/list"]);
        }
      });
    } else {
      this.espritService.addEsprit(this.esprit.saveState()).then(result => {
        if (result) {
          this.router.navigate(["/organisateur/esprits/list"]);
        }
      });
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