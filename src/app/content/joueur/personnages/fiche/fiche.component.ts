import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../../../../services/@core/authentication.service';
import { PersonnageService, IPersonnage } from '../../../../services/personnage.service';
import { IUser } from '../../../../services/@core/user.service';

@Component({
  selector: 'app-joueur-fiche-personnage',
  templateUrl: './fiche.component.html'
})
export class JoueurPersonnageFicheComponent implements OnInit {

  constructor(
    public auth: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private personnageService: PersonnageService,
  ) { }

  id: string;
  personnage = {} as IPersonnage;

  ngOnInit() {
    this._getPersonnage();
  }

  public get user(): IUser {
    return this.auth.user;
  }

  private _getPersonnage(): void {
    this.activatedRoute.params.subscribe(async (params: Params) => {
      if (params['id']) {
        this.personnage = await this.personnageService.getPersonnage(params['id']);
        await this.personnageService.buildPersonnage(this.personnage);
      }
    });
  }

}
