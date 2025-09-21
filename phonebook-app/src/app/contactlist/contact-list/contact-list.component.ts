import { Component, OnInit } from '@angular/core';
import { Contact } from '../contact';
import { ContactService } from '../contact.service';
import { CommonModule } from '@angular/common'; // для ngIf, ngFor
import { FormsModule } from '@angular/forms';   // для ngModel
import { ContactDetailsComponent } from '../contact-details/contact-details.component';

@Component({
  selector: 'contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ContactDetailsComponent],
  providers: [ContactService]
})

export class ContactListComponent implements OnInit {
  contacts: Contact[] = [];
  selectedContact: Contact = { name: '', email: '', phone: { work: '', mobile: '' }, _id: '' };

  constructor(private contactService: ContactService) { }

  ngOnInit() {
    this.contactService.getContacts().subscribe(contacts => {
      this.contacts = contacts.map(c => {
        if (!c.phone) c.phone = { mobile: '', work: '' };
        return c;
      });
    });
  }

  private getIndexOfContact(contactId: string): number {
    return this.contacts.findIndex(c => c._id === contactId);
  }

  selectContact(contact: Contact) {
    this.selectedContact = contact;
  }

  createNewContact() {
    const contact: Contact = {
      name: '',
      email: '',
      phone: { work: '', mobile: '' },
      _id: '' // добавляем пустой id
    };
    this.selectContact(contact);
  }

  deleteContact = (contactId: string) => {
    const idx = this.getIndexOfContact(contactId);
    // if (idx !== -1) {
    //   this.contacts.splice(idx, 1);
    //   this.selectContact(undefined);
    // }
    if (idx !== -1) this.contacts.splice(idx, 1);
    this.selectedContact = { name: '', email: '', phone: { work: '', mobile: '' }, _id: '' }; // пустой объект
  }

  addContact = (contact: Contact) => {
    this.contacts.push(contact);
    this.selectContact(contact);
  }

  updateContact = (contact: Contact) => {
    const idx = this.getIndexOfContact(contact._id);
    if (idx !== -1) this.contacts[idx] = contact;
    this.selectContact(contact);
  }
}

