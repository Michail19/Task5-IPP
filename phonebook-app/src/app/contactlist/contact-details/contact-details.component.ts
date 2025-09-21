import { Component, Input } from '@angular/core';
import { Contact } from '../contact';
import { CommonModule } from '@angular/common'; // для ngIf, ngFor
import { FormsModule } from '@angular/forms';   // для ngModel
import { ContactService } from '../contact.service';

@Component({
  selector: 'contact-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-details.component.html',
  styleUrls: ['./contact-details.component.css']
})
export class ContactDetailsComponent {
  @Input() contact!: Contact;
  @Input() createHandler!: (contact: Contact) => void;
  @Input() updateHandler!: (contact: Contact) => void;
  @Input() deleteHandler!: (id: string) => void;

  constructor(private contactService: ContactService) {}

  createContact(contact: Contact) {
    this.contactService.createContact(contact).subscribe(newContact => {
      this.createHandler(newContact);
    });
  }

  updateContact(contact: Contact) {
    this.contactService.updateContact(contact).subscribe(updatedContact => {
      this.updateHandler(updatedContact);
    });
  }

  deleteContact(contactId: string) {
    this.contactService.deleteContact(contactId).subscribe(() => {
      this.deleteHandler(contactId);
    });
  }
}
