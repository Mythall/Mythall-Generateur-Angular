import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthenticationService } from '../authentication.service';
import { tap } from 'rxjs/operators';

@Injectable()
export class AnimateurGuard implements CanActivate {

  constructor(private auth: AuthenticationService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {

    return of(this.auth.user && this.auth.isAnimateur(this.auth.user)).pipe(
      tap(isAdmin => {
        if (!isAdmin) {
          console.error('Access Denied - Animateur Only')
        }
      })
    );

  }
}