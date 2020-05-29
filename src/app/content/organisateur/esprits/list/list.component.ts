import { Component, OnInit } from '@angular/core';
import { EspritService, IEsprit } from '../../../../services/esprit.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../../layout/dialogs/delete/delete.dialog.component';

@Component({
  selector: 'app-organisateur-esprits-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class OrganisateurEspritsListComponent implements OnInit {

  constructor(
    private espritService: EspritService,
    public dialog: MatDialog
  ) { }

  esprits: IEsprit[];

  ngOnInit() {
    this._getEsprits();
  }

  private async _getEsprits(): Promise<void> {
    this.esprits = await this.espritService.getEsprits();
  }

  public confirmDelete(item: IEsprit): void {
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: 'auto',
      data: { displayname: item.nom, item: item }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.espritService.deleteEsprit(result);
      }
    });
  }

}