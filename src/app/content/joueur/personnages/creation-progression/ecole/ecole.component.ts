import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { PersonnageService, IPersonnage } from '../../../../../services/personnage.service';
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
  @Input() personnage: IPersonnage;

  @Output() personnageChange: EventEmitter<IPersonnage> = new EventEmitter<IPersonnage>();
  @Output() completedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  selectedEcole: IEcole;
  availableEcoles: IEcole[] = [];

  ngOnInit() {
    this._getAvailableEcoles();
  }

  public get isCompleted(): boolean {
    return this.selectedEcole ? true : false;
  }

  private async _getAvailableEcoles() {
    this.availableEcoles = await this.personnageService.getAvailableEcoles();
  }


  public setEcole(): void {
    this.personnage.ecoleRef = this.selectedEcole.id;
    this.personnage.ecole = this.selectedEcole;
  }

  public async next(): Promise<void> {
    if (this.isCompleted) {

      // Rebuild Personnage
      const personnage = await this.personnageService.buildPersonnage(this.personnage);

      // Emit & Allow next step
      this.personnageChange.emit(personnage);
      this.completedChange.emit(true);

    }
  }

}