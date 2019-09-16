import { Component, OnInit } from '@angular/core';
import { AlignementService } from '../../../../services/alignement.service';
import { Alignement } from '../../../../models/alignement';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogComponent } from '../../../../layout/dialogs/delete/delete.dialog.component';
import { ToastService } from '../../../../services/@core/toast.service';

@Component({
  selector: 'app-organisateur-alignements-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class OrganisateurAlignementsListComponent implements OnInit {

  constructor(
    private alignementService: AlignementService,
    public dialog: MatDialog,
    private toast: ToastService
  ) { }

  alignements: Alignement[];

  ngOnInit() {
    this.alignementService.getAlignements$().subscribe(result => this.alignements = result);
  }

  confirmDelete(item: Alignement) {
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: 'auto',
      data: { displayname: item.nom, item: item }
    });

    dialogRef.afterClosed().subscribe((result: Alignement) => {
      if (result) {
        this.alignementService.deleteAlignement(result.id).subscribe(res => this.toast.delete(result.nom));
      }
    });
  }

}