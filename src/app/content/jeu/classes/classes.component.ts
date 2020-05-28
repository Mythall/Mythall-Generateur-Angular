import { Component, OnInit } from '@angular/core';
import { ClasseService, IClasse } from '../../../services/classe.service';

@Component({
  selector: 'app-jeu-classes',
  templateUrl: './classes.component.html',
  styleUrls: ['./classes.component.scss']
})
export class JeuClassesComponent implements OnInit {

  constructor(
    private classeService: ClasseService
  ) { }

  classes: IClasse[];
  multiClasses: IClasse[];

  ngOnInit() {
    this._getClasses();
  }

  private async _getClasses(): Promise<void> {
    this.multiClasses = await this.classeService.getClasses();
    this.classes = this.multiClasses.filter(classe => !classe.prestige);
  }

}
