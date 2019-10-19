import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimelapseComponent } from './timelapse.component';


const routes: Routes = [
  { path: ':name', component: TimelapseComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimelapseRoutingModule { }
