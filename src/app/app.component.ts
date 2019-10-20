import { Component } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private swUpdate: SwUpdate,
    private snackbar: MatSnackBar
  ) {
    this.swUpdate.available.subscribe(evt => {
      const snack = this.snackbar.open('Update Available', 'Reload', { duration: 6000 });
      snack.onAction().subscribe(() => {
        window.location.reload();
      });
    });
  }

}
