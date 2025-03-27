import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/@core/authentication.service';
import { IUser } from '../../services/@core/user.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: 'sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})

export class SidenavComponent implements OnInit { 

  constructor(
    public auth: AuthenticationService
  ){}

  ngOnInit(){
    
  }

  public get user(): IUser {
    return this.auth.user;
  }

}