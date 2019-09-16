import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {

  constructor(){ }

  @Output() sidenavToggle : EventEmitter<boolean> = new EventEmitter<boolean>(false);


  toggle(){
    this.sidenavToggle.next();
  }

}
