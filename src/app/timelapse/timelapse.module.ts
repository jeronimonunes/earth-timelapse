import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimelapseRoutingModule } from './timelapse-routing.module';
import { TimelapseComponent } from './timelapse.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ImageCacheService } from './services/image-cache.service';
import { LoadingModule } from '../loading/loading.module';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';


@NgModule({
  declarations: [TimelapseComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TimelapseRoutingModule,
    MatButtonModule,
    FontAwesomeModule,
    LoadingModule
  ],
  providers: [ImageCacheService]
})
export class TimelapseModule { }
