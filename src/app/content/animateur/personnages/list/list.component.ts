import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DeleteDialogComponent } from '../../../../layout/dialogs/delete/delete.dialog.component';
import { PersonnageService, IPersonnage } from '../../../../services/personnage.service';

@Component({
  selector: 'app-animateur-personnages-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class AnimateurPersonnagesListComponent implements OnInit {

  constructor(
    private personnageService: PersonnageService,
    public dialog: MatDialog
  ) { }

  @ViewChild(MatPaginator) paginator: MatPaginator;
  length = 0;
  pageSize = 1000;
  pageSizeOptions = [1000, 10000];
  pageEvent: PageEvent;

  sortedData: any;
  personnages: IPersonnage[] = [];
  filter: any = {
    nom: '',
    joueur: '',
    race: '',
    classe: ''
  };

  ngOnInit() {
    this._getPersonnages();
  }

  private async _getPersonnages(): Promise<void> {
    this.personnages = await this.personnageService.getPersonnages();
    this.sortedData = this.personnages.slice(0, this.pageSize);
    this.length = this.personnages.length;
  }

  public confirmDelete(item: IPersonnage): void {
    let dialogRef = this.dialog.open(DeleteDialogComponent, {
      width: 'auto',
      data: { displayname: item.nom, item: item }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        await this.personnageService.deletePersonnage(result);
      }
    });
  }

  public filterResult(personnage: IPersonnage): boolean {

    let result: boolean = true;

    if (this.filter.nom) {
      if (!personnage.nom.toLowerCase().includes(this.filter.nom.toLowerCase())) {
        result = false;
      }
    }

    if (this.filter.joueur) {
      if (!personnage.user.displayname.toLowerCase().includes(this.filter.joueur.toLowerCase())) {
        result = false;
      }
    }

    if (this.filter.race) {
      if (!personnage.race.nom.toLowerCase().includes(this.filter.race.toLowerCase())) {
        result = false;
      }
    }

    return result;

  }

  public sortData(sort: Sort): void {
    const data = this.personnages.slice();
    if (!sort.active || sort.direction == '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      let isAsc = sort.direction == 'asc';
      switch (sort.active) {
        case 'nom': return this._compare(a.nom, b.nom, isAsc);
        case 'joueur': return this._compare(a.user.displayname, b.user.displayname, isAsc);
        case 'race': return this._compare(a.race.nom, b.race.nom, isAsc);
        default: return 0;
      }
    });
  }

  public setPageEvent(event: PageEvent): void {
    this.pageEvent = event;
    this.sortedData = this.personnages.slice(this.pageEvent.pageIndex * this.pageEvent.pageSize, (this.pageEvent.pageIndex + 1) * this.pageEvent.pageSize);
  }

  private _compare(a, b, isAsc): number {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

}