import { Component, OnInit } from '@angular/core';
import { DonService, IDon } from '../../../services/don.service';

@Component({
  selector: 'app-jeu-dons',
  templateUrl: './dons.component.html',
  styleUrls: ['./dons.component.scss']
})
export class JeuDonsComponent implements OnInit {

  constructor(
    private donService: DonService
  ) { }

  dons: IDon[];

  ngOnInit() {
    this._getDons();
  }

  private async _getDons(): Promise<void> {
    this.dons = await this.donService.getDons();
  }

}
