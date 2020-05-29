import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../../layout/dialogs/delete/delete.dialog.component';
import { RaceService, IRace } from '../../../../services/race.service';

@Component({
  selector: 'app-organisateur-races-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class OrganisateurRacesListComponent implements OnInit {

  constructor(
    private raceService: RaceService,
    public dialog: MatDialog
  ) { }

  races: IRace[];

  ngOnInit() {
    this._getRaces();
  }

  private async _getRaces(): Promise<void> {
    this.races = await this.raceService.getRaces();
  }

  public confirmDelete(item: IRace) {
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: 'auto',
      data: { displayname: item.nom, item: item }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.raceService.deleteRace(result);
      }
    });
  }

}