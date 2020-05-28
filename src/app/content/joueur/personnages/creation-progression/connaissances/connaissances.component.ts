import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatStepper } from '@angular/material/stepper';
import { Personnage } from '../../../../../services/personnages/models/personnage';
import { PersonnageService } from '../../../../../services/personnages/personnage.service';
import { Choix } from '../../../../../services/personnages/models/choix';
import { IDon, DonItem } from '../../../../../services/don.service';

@Component({
  selector: 'creation-progression-connaissances',
  templateUrl: './connaissances.component.html'
})
export class JoueurPersonnageCreationProgressionConnaissancesComponent implements OnInit {

  constructor(
    private personnageService: PersonnageService
  ) { }

  @Input() stepper: MatStepper;
  @Input() progression: boolean;
  @Input() personnage: Personnage;
  @Input() choixPersonnage: Choix[];

  @Output() personnageChange: EventEmitter<Personnage> = new EventEmitter<Personnage>();
  @Output() completedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  selectedConnaissances: IDon[] = [];
  availableConnaissances = [];
  quantity = [];
  currentIndex: number = 0;

  ngOnInit() {
    this.getAvailableConnaissances();

    // Get the amount of connaissances to choose
    this.choixPersonnage.forEach((choix) => {
      if (choix.type == 'don' && choix.categorie == 'Connaissance' && choix.quantite > 0) {
        this.quantity = Array(choix.quantite).fill(1).map((x, i) => i); // Crée un array de la quantité de choix [1,2,3,...]
      }
    });

  }

  public get isCompleted(): boolean {
    return this.selectedConnaissances && this.selectedConnaissances.length == this.quantity.length ? true : false;
  }

  getAvailableConnaissances() {
    this.personnageService.getAvailableConnaissances(this.personnage).then(response => {
      this.availableConnaissances[this.currentIndex] = response;
    });
  }

  setConnaissance(index) {

    // Set Current Index
    this.currentIndex = index + 1;

    // Set Current connaissance
    if (!this.personnage.dons) this.personnage.dons = [];

    const selectedConnaissanceItem: DonItem = new DonItem();
    selectedConnaissanceItem.don = this.selectedConnaissances[index];
    selectedConnaissanceItem.donRef = this.selectedConnaissances[index].id;
    selectedConnaissanceItem.niveauObtention = this.personnage.niveauReel;

    this.personnage.dons.push(selectedConnaissanceItem);

    // Refresh List of Available connaissances
    this.getAvailableConnaissances();

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