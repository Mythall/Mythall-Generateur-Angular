import { Component, OnInit } from '@angular/core';
import { RaceService, IRace } from '../../../services/race.service';

@Component({
  selector: 'app-jeu-races',
  templateUrl: './races.component.html',
  styleUrls: ['./races.component.scss']
})
export class JeuRacesComponent implements OnInit {

  constructor(
    private raceService: RaceService
  ){}

  races: IRace[];

  ngOnInit(){
    this._getRaces();
  }

  private async _getRaces(): Promise<void> {
    this.races = await this.raceService.getRaces();
  }

}
