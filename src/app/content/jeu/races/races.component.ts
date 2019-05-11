import { Component, OnInit, ElementRef } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

import { ClasseService } from '../../../services/classes/classe.service';
import { RaceService } from '../../../services/races/race.service';
import { Race } from '../../../services/races/models/race';

@Component({
  selector: 'app-jeu-races',
  templateUrl: './races.component.html',
  styleUrls: ['./races.component.scss']
})
export class JeuRacesComponent implements OnInit {

  constructor(
    private classeService: ClasseService,
    private raceService: RaceService
  ){}

  races: Race[];

  ngOnInit(){
    this.getRaces();
  }

  getRaces(){
    this.raceService.getRaces().subscribe(response => {
      this.races = response;
    });
  }

  scroll(el) {
    console.log(el);
    el.scrollIntoView();
}

}
