import { DiveDetailComponent } from './components/dive-detail/dive-detail.component';
import { DiveService } from './services/dive.service';
import { DiveListComponent } from './components/dive-list/dive-list.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    DiveListComponent,
    DiveDetailComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule
  ],
  providers: [
    DiveService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
