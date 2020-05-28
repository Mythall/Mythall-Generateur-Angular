import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../../layout/dialogs/delete/delete.dialog.component';
import { ClasseService, IClasse } from '../../../../services/classe.service';

@Component({
  selector: 'app-organisateur-classes-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class OrganisateurClassesListComponent implements OnInit {

  constructor(
    private classeService: ClasseService,
    public dialog: MatDialog
  ) { }

  classes: IClasse[];

  ngOnInit() {
    this._getClasses();
  }

  private async _getClasses(): Promise<void> {
    this.classes = await this.classeService.getClasses();
  }

  public confirmDelete(item: IClasse): void {
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: 'auto',
      data: { displayname: item.nom, item: item }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.classeService.deleteClasse(result);
      }
    });
  }

}