import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { AuthenticationService } from '../../../../services/@core/authentication.service';
import { PersonnageService } from '../../../../services/personnages/personnage.service';
import { Personnage } from '../../../../services/personnages/models/personnage';
import { Subscription } from 'rxjs';
import { User } from '../../../../services/@core/models/user';

@Component({
  selector: 'app-joueur-fiche-personnage',
  templateUrl: './fiche.component.html'
})
export class JoueurPersonnageFicheComponent implements OnInit, OnDestroy {

  constructor(
    public auth: AuthenticationService,
    private activatedRoute: ActivatedRoute,
    private personnageService: PersonnageService,
  ) { }

  id: string;
  personnage: Personnage = new Personnage();
  user: User;
  private _subscription: Subscription;

  ngOnInit() {
    this._getPersonnage();
    this.getUser();
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }

  private _getPersonnage(): void {
    this.activatedRoute.params.subscribe(async (params: Params) => {
      if (params['id']) {
        this._subscription = this.personnageService.getPersonnage(params['id']).subscribe(async (response) => {
          this.personnage = await this.personnageService.buildPromise(response);
        })
      }
    });
  }

  getUser() {
    this.auth.user.subscribe(response => {
      this.user = response
    });
  }

}
