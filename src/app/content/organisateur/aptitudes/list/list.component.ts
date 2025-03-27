import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort as MatSort } from '@angular/material/sort';
import { DeleteDialogComponent } from '../../../../layout/dialogs/delete/delete.dialog.component';
import { AptitudeService, IAptitude } from '../../../../services/aptitude.service';

@Component({
  selector: 'app-organisateur-aptitudes-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class OrganisateurAptitudesListComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private aptitudeService: AptitudeService,
  ) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  length = 0;
  pageSize = 50;
  pageSizeOptions = [50, 100, 200];
  pageEvent: PageEvent;

  sortedData: any;
  aptitudes: IAptitude[] = [];
  filter: any = {
    nom: '',
    description: ''
  };

  ngOnInit() {
    this._getAptitudes();
  }

  private async _getAptitudes(): Promise<void> {
    this.aptitudes = await this.aptitudeService.getAptitudes();
    this.sortedData = this.aptitudes.slice(0, this.pageSize);
    this.length = this.aptitudes.length;
  }

  public confirmDelete(item: IAptitude): void {
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: 'auto',
      data: { displayname: item.nom, item: item }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.aptitudeService.deleteAptitude(result);
      }
    });
  }

  public filterResult(aptitude: IAptitude): boolean {

    let result: boolean = true;

    if (this.filter.nom) {
      if (!aptitude.nom.toLowerCase().includes(this.filter.nom.toLowerCase())) {
        result = false;
      }
    }

    if (this.filter.description) {
      if (!aptitude.description.toLowerCase().includes(this.filter.description.toLowerCase())) {
        result = false;
      }
    }

    return result;

  }

  public sortData(matSort: MatSort): void {
    const data = this.aptitudes.slice();
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
    this.sortedData = this.aptitudes.slice(this.pageEvent.pageIndex * this.pageEvent.pageSize, (this.pageEvent.pageIndex + 1) * this.pageEvent.pageSize);
  }

  private _compare(a, b, isAsc): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}