import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelapseRoutingModule } from './timelapse-routing.module';
import { TimelapseComponent } from './timelapse.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingModule } from '../loading/loading.module';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@NgModule({
  declarations: [TimelapseComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TimelapseRoutingModule,
    MatButtonModule,
    MatSliderModule,
    MatFormFieldModule,
    MatInputModule,
    FontAwesomeModule,
    LoadingModule
  ]
})
export class TimelapseModule { }
