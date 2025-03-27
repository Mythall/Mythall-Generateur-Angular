import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../../services/@core/authentication.service';
import { UserService, IUser } from '../../../services/@core/user.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {

  constructor(
    public auth: AuthenticationService,
    private userService: UserService
  ) { }

  ngOnInit() {
    
  }

  public get user(): IUser {
    return this.auth.user;
  }

}
