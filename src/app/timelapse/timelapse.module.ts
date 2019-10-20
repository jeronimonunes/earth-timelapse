import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelapseRoutingModule } from './timelapse-routing.module';
import { TimelapseComponent } from './timelapse.component';
import { MatSliderModule } from '@angular/material/slider';
import { ReactiveFormsModule } from '@angular/forms';
import { ImageCacheService } from './services/image-cache.service';
import { LoadingModule } from '../loading/loading.module';


@NgModule({
  declarations: [TimelapseComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TimelapseRoutingModule,
    LoadingModule,
    MatSliderModule
  ],
  providers: [ImageCacheService]
})
export class TimelapseModule { }
