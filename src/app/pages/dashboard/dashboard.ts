import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ContactService, Contact, ContactListResponse } from '../../services/contact';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SocketService } from '../../services/socket.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact-dashboard',
  templateUrl: './dashboard.html',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor, MatProgressSpinnerModule,MatButtonModule,MatFormFieldModule, MatInputModule, MatCardModule, MatIconModule, MatSnackBarModule],
})
export class ContactDashboardPage implements OnInit, OnDestroy {
  contacts: Contact[] = [];
  isLoading = true;
  editingId: string | null = null;
  editableContact: Contact = {
    _id: '',
    name: '',
    phone: '',
    address: '',
    notes: '',
  };
  newContact: Contact = {
  _id: '',
  name: '',
  phone: '',
  address: '',
  notes: '',
};
addContact() {
  if (!this.newContact.name || !this.newContact.phone) {
    alert('Name and Phone are required');
    return;
  }

  this.contactService.addContact(this.newContact).subscribe(() => {
    this.loadContacts();
    this.resetNewContact();
    this.snackBar.open('Contact added successfully!', 'Close', { duration: 3000 });
  });
}

private resetNewContact() {
  this.newContact = {
    _id: '',
    name: '',
    phone: '',
    address: '',
    notes: '',
  };
}

  lockedContacts: { [key: string]: string } = {};
  userId: string = Math.random().toString(36).substring(2, 15);

  private subscriptions: Subscription[] = [];

  constructor(
    private contactService: ContactService,
    private dialog: MatDialog,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadContacts();

    this.subscriptions.push(
      this.socketService.onContactLocked().subscribe(({ contactId, userId }) => {
        this.lockedContacts[contactId] = userId;

        if (userId !== this.userId) {
          this.snackBar.open(
            `User ${userId} is updating contact with ID ${contactId}`,
            'Close',
            { duration: 4000 }
          );
        }
      }),
      this.socketService.onContactUnlocked().subscribe(({ contactId }) => {
        delete this.lockedContacts[contactId];
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadContacts() {
    this.isLoading = true;
    this.contactService.getContacts().subscribe((res: ContactListResponse) => {
      this.contacts = res.contacts;
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  startEdit(contact: Contact) {
    const id = contact._id;
    if (!id) return alert('Invalid contact ID.');

    if (this.isLockedByOtherUser(id)) {
      return alert('This contact is currently being edited by someone else.');
    }

    this.socketService.lockContact(id, this.userId);
    this.editingId = id;
    this.editableContact = { ...contact };
  }

  cancelEdit() {
    if (this.editingId) {
      this.socketService.unlockContact(this.editingId, this.userId);
    }
    this.editingId = null;
    this.resetEditableContact();
  }



  saveEdit(id: string | null) {
    if (!id) return alert('Invalid contact ID.');

    this.contactService.updateContact(id, this.editableContact).subscribe(() => {
      this.socketService.unlockContact(id, this.userId);
      this.editingId = null;
      this.resetEditableContact();
      this.loadContacts();
    });
  }

  deleteContact(id: string | undefined) {
    if (!id) return alert('Invalid contact ID.');

    this.contactService.deleteContact(id).subscribe(() => {
      this.loadContacts();
    });
  }

  isLockedByOtherUser(contactId: string | undefined | null): boolean {
    if (!contactId) return false;
    return contactId in this.lockedContacts && this.lockedContacts[contactId] !== this.userId;
  }

  private resetEditableContact() {
    this.editableContact = {
      _id: '',
      name: '',
      phone: '',
      address: '',
      notes: '',
    };
  }
}
