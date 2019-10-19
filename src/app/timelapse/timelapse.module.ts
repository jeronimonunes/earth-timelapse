import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelapseRoutingModule } from './timelapse-routing.module';
import { TimelapseComponent } from './timelapse.component';


@NgModule({
  declarations: [TimelapseComponent],
  imports: [
    CommonModule,
    TimelapseRoutingModule
  ]
})
export class TimelapseModule { }
