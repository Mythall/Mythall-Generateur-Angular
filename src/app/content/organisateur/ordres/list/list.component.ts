import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../../layout/dialogs/delete/delete.dialog.component';
import { OrdreService, IOrdre } from '../../../../services/ordre.service';

@Component({
  selector: 'app-organisateur-ordres-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class OrganisateurOrdresListComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private ordreService: OrdreService    
  ) { }

  ordres: IOrdre[];

  ngOnInit() {
    this._getOrdres();
  }

  private async _getOrdres(): Promise<void> {
    this.ordres = await this.ordreService.getOrdres();
  }

  public confirmDelete(item: IOrdre): void {
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: 'auto',
      data: { displayname: item.nom, item: item }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.ordreService.deleteOrdre(result);
      }
    });
  }

}