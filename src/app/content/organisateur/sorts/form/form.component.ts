import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { IEcole, EcoleService } from '../../../../services/ecole.service';
import { PorteService, IPorte } from '../../../../services/porte.service';
import { SortService, ISort } from '../../../../services/sort.service';
import { IDuree, DureeService } from '../../../../services/duree.service';
import { ZoneService, IZone } from '../../../../services/zone.service';

@Component({
  selector: 'app-organisateur-sorts-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class OrganisateurSortsFormComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private sortService: SortService,
    private ecoleService: EcoleService,
    private porteService: PorteService,
    private dureeService: DureeService,
    private zoneService: ZoneService,
    private router: Router
  ) { }

  id: string;
  sort = {} as ISort;
  ecoles: IEcole[];
  portes: IPorte[];
  durees: IDuree[];
  zones: IZone[];

  ngOnInit() {
    this.getSort();
    this._getEcoles();
    this._getPortes();
    this._getDurees();
    this._getZones();
  }

  public getSort(): void {
    this.activatedRoute.params.subscribe(async (params: Params) => {
      if (params['id']) {
        this.id = params['id'];
        this.sort = await this.sortService.getSort(this.id);
      }
    });
  }

  private async _getEcoles(): Promise<void> {
    this.ecoles = await this.ecoleService.getEcoles();
  }

  private async _getPortes(): Promise<void> {
    this.portes = await this.porteService.getPortes();
  }

  private async _getDurees(): Promise<void> {
    this.durees = await this.dureeService.getDurees();
  }

  private async _getZones(): Promise<void> {
    this.zones = await this.zoneService.getZones();
  }

  public async submit() {
    if (this.id) {
      const result = await this.sortService.updateSort(this.sort);
      if (result) {
        this.router.navigate(["/organisateur/sorts/list"]);
      }
    } else {
      const result = await this.sortService.addSort(this.sort);
      if (result) {
        this.router.navigate(["/organisateur/sorts/list"]);
      }
    }
  }

}