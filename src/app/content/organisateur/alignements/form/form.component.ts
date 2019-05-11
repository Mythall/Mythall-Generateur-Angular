import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ToastService } from '../../../../services/@core/toast.service';
import { AlignementService } from '../../../../services/alignement.service';
import { Alignement } from '../../../../models/alignement';

@Component({
  selector: 'app-organisateur-alignements-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class OrganisateurAlignementsFormComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private alignementService: AlignementService,
    private router: Router,
    private toast: ToastService
  ) { }

  id: string;
  alignement: Alignement = new Alignement();

  ngOnInit() {
    this.getAlignement();
  }

  getAlignement() {
    this.activatedRoute.params.subscribe((params: Params) => {
      if (params['id']) {
        this.id = params['id'];
        this.alignementService.getAlignement(this.id).subscribe((response: Alignement) => {
          this.alignement.map(response);
        });
      }
    });
  }

  submit() {

    if (this.id) {

      // Update
      this.alignementService.updateAlignement(this.alignement).subscribe(result => {
        if (result) {
          this.toast.update(result.nom);
          this.router.navigate(["/organisateur/alignements/list"]);
        }
      });

    } else {

      // Add
      this.alignementService.addAlignement(this.alignement).subscribe(result => {
        if (result) {
          this.toast.add(result.nom);
          this.router.navigate(["/organisateur/alignements/list"]);
        }
      });

    }
  }

}