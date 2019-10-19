import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelapseRoutingModule } from './timelapse-routing.module';
import { TimelapseComponent } from './timelapse.component';
import { MatSliderModule } from '@angular/material/slider';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [TimelapseComponent],
  imports: [
    CommonModule,
    TimelapseRoutingModule,
    MatSliderModule,
    HttpClientModule
  ]
})
export class TimelapseModule { }
