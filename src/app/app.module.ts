import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CalendarModule} from "primeng/calendar";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {TableModule} from "primeng/table";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {TimeCalculatorService} from "../services/time-calculator.service";

@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgbModule,
        FormsModule,
        CalendarModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        FontAwesomeModule,
    ],
  providers: [TimeCalculatorService],
  bootstrap: [AppComponent]
})
export class AppModule { }
