import { Component, OnInit } from '@angular/core';
import { ClasseService, IClasse } from '../../../services/classe.service';

@Component({
  selector: 'app-jeu-classes-prestige',
  templateUrl: './classes-prestige.component.html',
  styleUrls: ['./classes-prestige.component.scss']
})
export class JeuClassesPrestigeComponent implements OnInit {

  constructor(
    private classeService: ClasseService
  ) { }

  classes: IClasse[];

  ngOnInit() {
    this._getClassesPrestige();
  }

  private async _getClassesPrestige(): Promise<void> {
    this.classes = await this.classeService.getClasses(false, true);
  }

}
