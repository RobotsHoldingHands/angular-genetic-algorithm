import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgApexchartsModule } from "ng-apexcharts";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ListService } from './services/list/list.service';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgApexchartsModule,
    BrowserAnimationsModule,
    MatSliderModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCheckboxModule
  ],
  providers: [ListService],
  bootstrap: [AppComponent]
})
export class AppModule { }
