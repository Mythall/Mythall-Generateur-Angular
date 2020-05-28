import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { OrdreService, IOrdre } from '../../../../services/ordre.service';
import { ClasseService } from '../../../../services/classes/classe.service';
import { Classe } from '../../../../services/classes/models/classe';
import { IAlignement, AlignementService } from '../../../../services/alignement.service';

@Component({
  selector: 'app-organisateur-ordres-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class OrganisateurOrdresFormComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private ordreService: OrdreService,
    private alignementService: AlignementService,
    private classeService: ClasseService,
    private router: Router
  ) { }

  id: string;
  ordre = {} as IOrdre;
  classes: Classe[];
  alignements: IAlignement[];

  ngOnInit() {
    this._getOrdre();
    this.getClasses();
    this._getAlignements();
  }

  private _getOrdre(): void {
    this.activatedRoute.params.subscribe(async (params: Params) => {
      if (params['id']) {
        this.id = params['id'];
        this.ordre = await this.ordreService.getOrdre(this.id);
      }
    });
  }

  getClasses() {
    this.classeService.getClasses().subscribe(response => {
      this.classes = response;
    })
  }

  private async _getAlignements(): Promise<void> {
    this.alignements = await this.alignementService.getAlignements();
  }

  public async submit(): Promise<void> {
    if (this.id) {
      const result = await this.ordreService.updateOrdre(this.ordre)
      if (result) {
        this.router.navigate(["/organisateur/ordres/list"]);
      }
    } else {
      const result = await this.ordreService.addOrdre(this.ordre)
      if (result) {
        this.router.navigate(["/organisateur/ordres/list"]);
      }
    }
  }

}