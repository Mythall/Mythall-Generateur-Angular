import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SortService, ISort } from '../../../../services/sort.service';

@Component({
  selector: 'jeu-sort-details-dialog',
  templateUrl: './details.dialog.component.html',
  styleUrls: ['./details.dialog.component.scss']
})
export class JeuSortDetailsDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<JeuSortDetailsDialogComponent>,
    private sortService: SortService,
    @Inject(MAT_DIALOG_DATA) public id: string
  ) { }

  public sort: ISort;

  ngOnInit() {
    this._getSorts();
  }

  private async _getSorts(): Promise<void> {
    this.sort = await this.sortService.getSort(this.id);
  }

}