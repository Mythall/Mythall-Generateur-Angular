import { Component } from '@angular/core';
import { AuthenticationService } from '../../../../services/@core/authentication.service';
import { PersonnageService, IPersonnage } from '../../../../services/personnage.service';
import { IUser } from '../../../../services/@core/user.service';

@Component({
  selector: 'app-joueur-personnages-list',
  templateUrl: './list.component.html'
})
export class JoueurPersonnagesListComponent {

  constructor(
    private auth: AuthenticationService,
    private personnageService: PersonnageService
  ) { }

  public personnages: IPersonnage[] = [];

  ngOnInit() {
    this._getPersonnages();
  }

  public get user(): IUser {
    return this.auth.user;
  }

  private async _getPersonnages(): Promise<void> {
    this.personnages = await this.personnageService.getPersonnages(this.user.uid);
  }

}
