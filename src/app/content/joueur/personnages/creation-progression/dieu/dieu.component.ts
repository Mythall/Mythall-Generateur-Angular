import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';

import { Personnage } from '../../../../../services/personnages/models/personnage';
import { PersonnageService } from '../../../../../services/personnages/personnage.service';
import { IDieu } from '../../../../../services/dieu.service';

@Component({
  selector: 'creation-progression-dieus',
  templateUrl: './dieu.component.html'
})
export class JoueurPersonnageCreationProgressionDieuComponent implements OnInit {

  constructor(
    private personnageService: PersonnageService
  ) { }

  @Input() stepper: MatStepper;
  @Input() progression: boolean;
  @Input() personnage: Personnage;

  @Output() personnageChange: EventEmitter<Personnage> = new EventEmitter<Personnage>();
  @Output() completedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  selectedDieu: IDieu;
  availableDieus: IDieu[] = [];

  ngOnInit() {
    this._getAvailableDieux();
  }

  public get isCompleted(): boolean {
    return this.selectedDieu ? true : false;
  }

  private async _getAvailableDieux(): Promise<void> {
    this.availableDieus = await this.personnageService.getAvailableDieux(this.personnage);
  }

  setDieu() {
    this.personnage.dieuRef = this.selectedDieu.id;
    this.personnage.dieu = this.selectedDieu;
  }

  next() {
    if (this.isCompleted) {

      // Rebuild Personnage
      this.personnageService.buildPromise(this.personnage).then(personnage => {

        // Emit & Allow next step
        this.personnageChange.emit(personnage);
        this.completedChange.emit(true);
        setTimeout(() => {
          this.stepper.next();
        });

      });

    }
  }

}