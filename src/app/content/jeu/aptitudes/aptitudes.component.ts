import { Component, OnInit } from '@angular/core';
import { AptitudeService, IAptitude } from '../../../services/aptitude.service';

@Component({
  selector: 'app-jeu-aptitudes',
  templateUrl: './aptitudes.component.html',
  styleUrls: ['./aptitudes.component.scss']
})
export class JeuAptitudesComponent implements OnInit {

  constructor(
    private aptitudeService: AptitudeService
  ) { }

  aptitudes: IAptitude[];

  ngOnInit() {
    this._getAptitudes();
  }

  private async _getAptitudes(): Promise<void> {
    this.aptitudes = await this.aptitudeService.getAptitudes();
  }

}
