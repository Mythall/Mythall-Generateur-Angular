import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort as MatSort } from '@angular/material/sort';
import { DeleteDialogComponent } from '../../../../layout/dialogs/delete/delete.dialog.component';
import { DonService, IDon } from '../../../../services/don.service';

@Component({
  selector: 'app-organisateur-dons-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class OrganisateurDonsListComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private donService: DonService,    
  ) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  length = 0;
  pageSize = 50;
  pageSizeOptions = [50, 100, 200];
  pageEvent: PageEvent;

  sortedData: any;
  dons: IDon[] = [];
  filter: any = {
    nom: '',
    description: ''
  };

  ngOnInit() {
    this._getDons();
  }

  private async _getDons(): Promise<void> {
    this.dons = await this.donService.getDons();
    this.sortedData = this.dons.slice(0, this.pageSize);
    this.length = this.dons.length;
  }

  private confirmDelete(item: IDon): void {
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: 'auto',
      data: { displayname: item.nom, item: item }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.donService.deleteDon(result);
      }
    });
  }

  public filterResult(don: IDon): boolean {

    let result: boolean = true;

    if (this.filter.nom) {
      if (!don.nom.toLowerCase().includes(this.filter.nom.toLowerCase())) {
        result = false;
      }
    }

    if (this.filter.description) {
      if (!don.description.toLowerCase().includes(this.filter.description.toLowerCase())) {
        result = false;
      }
    }

    return result;

  }

  public sortData(matSort: MatSort): void {
    const data = this.dons.slice();
    if (!matSort.active || matSort.direction == '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      let isAsc = matSort.direction == 'asc';
      switch (matSort.active) {
        case 'nom': return this._compare(a.nom, b.nom, isAsc);
        default: return 0;
      }
    });
  }

  public setPageEvent(event: PageEvent): void {
    this.pageEvent = event;
    this.sortedData = this.dons.slice(this.pageEvent.pageIndex * this.pageEvent.pageSize, (this.pageEvent.pageIndex + 1) * this.pageEvent.pageSize);
  }

  private _compare(a, b, isAsc): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}