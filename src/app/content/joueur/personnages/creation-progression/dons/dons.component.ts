import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Personnage } from '../../../../../services/personnages/models/personnage';
import { PersonnageService } from '../../../../../services/personnages/personnage.service';
import { Choix } from '../../../../../services/personnages/models/choix';
import { IDon, DonItem } from '../../../../../services/don.service';

@Component({
  selector: 'creation-progression-dons',
  templateUrl: './dons.component.html'
})
export class JoueurPersonnageCreationProgressionDonsComponent implements OnInit {

  constructor(
    private personnageService: PersonnageService
  ) { }

  @Input() stepper: MatStepper;
  @Input() progression: boolean;
  @Input() personnage: Personnage;
  @Input() choixPersonnage: Choix[];

  @Output() personnageChange: EventEmitter<Personnage> = new EventEmitter<Personnage>();
  @Output() completedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  selectedDons: IDon[] = [];
  availableDons = [];
  quantity = [];
  currentIndex: number = 0;

  ngOnInit() {
    this._getAvailableDons();

    // Get the amount of dons to choose
    if (this.choixPersonnage) {
      this.choixPersonnage.forEach((choix) => {
        if (choix.type == 'don' && choix.categorie == 'Normal' && choix.quantite > 0) {
          this.quantity.push(Array(choix.quantite).fill(1).map((x, i) => i)); // Crée un array de la quantité de choix [1,2,3,...]
        }
      });
    }

  }

  public get isCompleted(): boolean {
    return this.selectedDons && this.selectedDons.length == this.quantity.length ? true : false;
  }

  private async _getAvailableDons(): Promise<void> {
    this.availableDons[this.currentIndex] = await this.personnageService.getAvailableDons(this.personnage);
  }

  public setDon(index): void {

    // Set Current Index
    this.currentIndex = index + 1;

    // Set Current don
    if (!this.personnage.dons) this.personnage.dons = [];

    const selectedDonItem = new DonItem();
    selectedDonItem.don = this.selectedDons[index];
    selectedDonItem.donRef = this.selectedDons[index].id;
    selectedDonItem.niveauObtention = this.personnage.niveauReel;

    this.personnage.dons.push(selectedDonItem);

    // Refresh List of Available dons
    this._getAvailableDons();

  }

  public async next(): Promise<void> {
    if (this.isCompleted) {

      // Rebuild Personnage
      const personnage = await this.personnageService.buildPromise(this.personnage);

      // Emit & Allow next step
      this.personnageChange.emit(personnage);
      this.completedChange.emit(true);
      setTimeout(() => {
        this.stepper.next();
      });

    }
  }

}