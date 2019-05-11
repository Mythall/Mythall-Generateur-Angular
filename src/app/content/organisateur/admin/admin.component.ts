import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/@core/admin.service';

@Component({
  selector: 'app-organisateur-admin',
  templateUrl: './admin.component.html'
})
export class OrganisateurAdminComponent implements OnInit {

  constructor(
    private adminService: AdminService
  ) { }

  ngOnInit() {

  }

}