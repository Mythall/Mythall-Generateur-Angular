import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort as MatSort } from '@angular/material/sort';
import { DeleteDialogComponent } from '../../../../layout/dialogs/delete/delete.dialog.component';
import { FourberieService, IFourberie } from '../../../../services/fourberie.service';

@Component({
  selector: 'app-organisateur-fourberies-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class OrganisateurFourberiesListComponent implements OnInit {

  constructor(
    private fourberieService: FourberieService,
    public dialog: MatDialog
  ) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  length = 0;
  pageSize = 50;
  pageSizeOptions = [50, 100, 200];
  pageEvent: PageEvent;

  sortedData: any;
  fourberies: IFourberie[] = [];
  filter: any = {
    nom: '',
    description: ''
  };

  ngOnInit() {
    this._getFourberies();
  }

  private async _getFourberies(): Promise<void> {
    this.fourberies = await this.fourberieService.getFourberies();
    this.sortedData = this.fourberies.slice(0, this.pageSize);
    this.length = this.fourberies.length;
  }

  public confirmDelete(item: IFourberie): void {
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: 'auto',
      data: { displayname: item.nom, item: item }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.fourberieService.deleteFourberie(result);
      }
    });
  }

  filterResult(fourberie: IFourberie): boolean {

    let result: boolean = true;

    if (this.filter.nom) {
      if (!fourberie.nom.toLowerCase().includes(this.filter.nom.toLowerCase())) {
        result = false;
      }
    }

    if (this.filter.description) {
      if (!fourberie.description.toLowerCase().includes(this.filter.description.toLowerCase())) {
        result = false;
      }
    }

    return result;

  }

  sortData(matSort: MatSort) {
    const data = this.fourberies.slice();
    if (!matSort.active || matSort.direction == '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      let isAsc = matSort.direction == 'asc';
      switch (matSort.active) {
        case 'nom': return compare(a.nom, b.nom, isAsc);
        default: return 0;
      }
    });
  }

  setPageEvent(event: PageEvent) {
    this.pageEvent = event;
    this.sortedData = this.fourberies.slice(this.pageEvent.pageIndex * this.pageEvent.pageSize, (this.pageEvent.pageIndex + 1) * this.pageEvent.pageSize);
  }

}

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}