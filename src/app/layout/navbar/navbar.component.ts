import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  constructor(
    private db: AngularFirestore
  ){  }

  @Output() sidenavToggle : EventEmitter<boolean> = new EventEmitter<boolean>(false);
  private settings: Observable<any>;
  
  ngOnInit(){
    this.settings = this.db.collection('settings').valueChanges();
  }

  toggle(){
    this.sidenavToggle.next();
  }

}
