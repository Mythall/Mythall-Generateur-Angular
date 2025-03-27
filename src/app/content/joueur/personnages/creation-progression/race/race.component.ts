import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { AuthenticationService } from '../../../../../services/@core/authentication.service';
import { RaceService, IRace } from '../../../../../services/race.service';
import { UserService, IUser } from '../../../../../services/@core/user.service';
import { IPersonnage } from '../../../../../services/personnage.service';

@Component({
  selector: 'creation-progression-race',
  templateUrl: './race.component.html'
})
export class JoueurPersonnageCreationProgressionRaceComponent implements OnInit {

  constructor(
    public auth: AuthenticationService,
    private raceService: RaceService,
    private userService: UserService
  ) { }

  @Input() stepper: MatStepper;
  @Input() progression: boolean;
  @Input() personnage: IPersonnage;

  @Output() personnageChange: EventEmitter<IPersonnage> = new EventEmitter<IPersonnage>();
  @Output() completedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  selectedRace: IRace;
  races: IRace[];
  users: IUser[];

  ngOnInit() {

    if (this.auth.isAnimateur(this.user)) {
      this._getUsers();
    }

    this._getRaces();

    if (this.personnage.race) {
      this.selectedRace = this.personnage.race;
    }

  }

  public get user(): IUser {
    return this.auth.user;
  }

  public get isCompleted(): boolean {
    return !!(this.personnage.nom && this.personnage.raceRef);
  }

  private async _getUsers(): Promise<void> {
    this.users = await this.userService.getUsers();
  }

  private async _getRaces(): Promise<void> {
    this.races = await this.raceService.getRaces();
  }

  public setRace(): void {
    if (!this.progression) {
      this.personnage.raceRef = this.selectedRace.id;
      this.personnage.race = this.selectedRace;
    }
  }

  public next(): void {
    if (this.isCompleted) {
      this.personnageChange.emit(this.personnage);
      this.completedChange.emit(true);
      setTimeout(() => { this.stepper.next() });
    }
  }

}