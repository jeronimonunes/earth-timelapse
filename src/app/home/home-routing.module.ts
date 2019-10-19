import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';
import { WorldWindCapabilitiesService } from '../services/world-wind-capabilities.service';


const routes: Routes = [
  { path: '', component: HomeComponent, resolve: { capabilities: WorldWindCapabilitiesService } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
