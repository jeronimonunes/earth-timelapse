import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelapseRoutingModule } from './timelapse-routing.module';
import { TimelapseComponent } from './timelapse.component';
import { MatSliderModule } from '@angular/material/slider';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { ImageCacheService } from './services/image-cache.service';


@NgModule({
  declarations: [TimelapseComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TimelapseRoutingModule,
    MatSliderModule,
    HttpClientModule
  ],
  providers: [ImageCacheService]
})
export class TimelapseModule { }
