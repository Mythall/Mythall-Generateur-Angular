import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { JeuSortDetailsDialogComponent } from './details/details.dialog.component';
import { SortService, ISort } from '../../../services/sort.service';

@Component({
  selector: 'app-jeu-sorts',
  templateUrl: './sorts.component.html',
  styleUrls: ['./sorts.component.scss']
})
export class JeuSortsComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private sortService: SortService
  ) { }

  sorts: ISort[];

  ngOnInit() {
    this._getSorts();
  }

  private async _getSorts(): Promise<void> {
    this.sorts = await this.sortService.getSorts();
  }

  scroll(el) {
    console.log(el);
    el.scrollIntoView();
  }

  displayDetails(id) {
    this.dialog.open(JeuSortDetailsDialogComponent, {
      width: 'auto',
      data: id
    });
  }

}
