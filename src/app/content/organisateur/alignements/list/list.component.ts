import { Component } from '@angular/core';
import { Alignements } from '../../../../models/alignement';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-organisateur-alignements-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class OrganisateurAlignementsListComponent {

  constructor(
    public dialog: MatDialog,
  ) { }

  alignements = Alignements;

}