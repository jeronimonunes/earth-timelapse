import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimelapseComponent } from './timelapse.component';
import { WorldWindCapabilitiesService } from '../services/world-wind-capabilities.service';


const routes: Routes = [
  { path: ':name', component: TimelapseComponent, resolve: { capabilities: WorldWindCapabilitiesService } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimelapseRoutingModule { }
