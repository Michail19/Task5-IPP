import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ContactListComponent } from './contactlist/contact-list/contact-list.component';
import { ContactDetailsComponent } from './contactlist/contact-details/contact-details.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppComponent,              // <-- импорт вместо declarations
    ContactListComponent,
    ContactDetailsComponent
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
