import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../../layout/dialogs/delete/delete.dialog.component';
import { DomaineService, IDomaine } from '../../../../services/domaine.service';

@Component({
  selector: 'app-organisateur-domaines-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class OrganisateurDomainesListComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private domaineService: DomaineService,
  ) { }

  domaines: IDomaine[];

  ngOnInit() {
    this._getDomaines();
  }

  private async _getDomaines(): Promise<void> {
    this.domaines = await this.domaineService.getDomaines();
  }

  public confirmDelete(item: IDomaine): void {
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: 'auto',
      data: { displayname: item.nom, item: item }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.domaineService.deleteDomaine(result);
      }
    });
  }

}