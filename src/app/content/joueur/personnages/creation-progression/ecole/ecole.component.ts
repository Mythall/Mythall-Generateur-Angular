import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';

import { Personnage } from '../../../../../services/personnages/models/personnage';
import { PersonnageService } from '../../../../../services/personnages/personnage.service';
import { IEcole } from '../../../../../services/ecole.service';

@Component({
  selector: 'creation-progression-ecoles',
  templateUrl: './ecole.component.html'
})
export class JoueurPersonnageCreationProgressionEcoleComponent implements OnInit {

  constructor(
    private personnageService: PersonnageService
  ) { }

  @Input() stepper: MatStepper;
  @Input() progression: boolean;
  @Input() personnage: Personnage;

  @Output() personnageChange: EventEmitter<Personnage> = new EventEmitter<Personnage>();
  @Output() completedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  selectedEcole: IEcole;
  availableEcoles: IEcole[] = [];

  ngOnInit() {
    this._getAvailableEcoles();
  }

  public get isCompleted(): boolean {
    return this.selectedEcole ? true: false;
  }

  private async _getAvailableEcoles() {
    this.availableEcoles = await this.personnageService.getAvailableEcoles(this.personnage);
  }


  setEcole() {
    this.personnage.ecoleRef = this.selectedEcole.id;
    this.personnage.ecole = this.selectedEcole;
  }

  next() {
    if (this.isCompleted) {

      // Rebuild Personnage
      this.personnageService.buildPromise(this.personnage).then(personnage => {

        // Emit & Allow next step
        this.personnageChange.emit(personnage);
        this.completedChange.emit(true);

      });

    }
  }

}