import { NgModule } from '@angular/core';
import { environment } from '../../environments/environment';

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';

@NgModule({
  imports: [
    AngularFireModule.initializeApp(environment.firebase),
    //AngularFirestoreModule.enablePersistence(),
    AngularFireAuthModule,
  ],
  exports: [
    AngularFireModule,
    AngularFirestoreModule,
    AngularFireAuthModule
  ]
})
export class FirebaseModule {}