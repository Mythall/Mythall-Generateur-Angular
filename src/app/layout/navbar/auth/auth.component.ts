import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/@core/authentication.service';
import { IUser } from '../../../services/@core/user.service';

@Component({
  selector: 'app-navbar-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class NavbarAuthComponent implements OnInit {

  constructor(
    public auth: AuthenticationService
  ) { }

  user: IUser;

  ngOnInit() {
    this.auth.user$.subscribe(response => this.user = response);
  }

}
