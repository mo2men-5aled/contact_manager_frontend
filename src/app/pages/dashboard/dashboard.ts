import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ContactService, Contact, ContactListResponse, ContactInput } from '../../services/contact';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LockSocketService } from '../../services/lock-socket.service';
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
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { AddContactDialogComponent } from '../../components/add-contact-dialog.component/add-contact-dialog.component';

@Component({
  selector: 'app-contact-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true,
  imports: [
    FormsModule, NgIf, MatProgressSpinnerModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatCardModule, MatIconModule,
    MatSnackBarModule, MatPaginatorModule, MatTableModule, MatToolbarModule,
    MatDialogModule
  ],
})
export class ContactDashboardPage implements OnInit, OnDestroy {
  displayedColumns: string[] = ['name', 'phone', 'address', 'notes', 'actions'];
  contacts: Contact[] = [];
  dataSource = new MatTableDataSource<Contact>([]);
  totalContacts = 0;
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

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  lockedContacts: { [key: string]: string } = {};
  userId: string = Math.random().toString(36).substring(2, 15);

  private subscriptions: Subscription[] = [];

  searchQuery: string = '';

  constructor(
    private contactService: ContactService,
    private socketService: LockSocketService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadContacts();

    this.subscriptions.push(
      this.socketService.onContactLocked().subscribe(({ contactId, username }) => {
        this.lockedContacts[contactId] = username;
        this.cdr.detectChanges();

        if (username !== this.userId) {
          this.snackBar.open(
            `Contact is being edited by another user`,
            'Close',
            { duration: 3000 }
          );
        }
      }),

      this.socketService.onContactUnlocked().subscribe(({ contactId }) => {
        delete this.lockedContacts[contactId];
        this.cdr.detectChanges();
      }),

      this.socketService.onLockError().subscribe(({ message }) => {
        this.snackBar.open(message, 'Close', { duration: 3000 });
      }),

      // this.socketService.onContactUpdated().subscribe(contactId => {
      //   this.loadContacts();
      // })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadContacts(page: number = 1, limit: number = 5, filters: any = {}) {
    this.isLoading = true;
    this.contactService.getContacts(page, limit, filters).subscribe({
      next: (res: ContactListResponse) => {
        this.contacts = res.contacts;
        this.totalContacts = res.total;
        this.dataSource = new MatTableDataSource<Contact>(this.contacts);
        if (this.paginator) this.dataSource.paginator = this.paginator;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.snackBar.open('Error loading contacts', 'Close', { duration: 3000 });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  startEdit(contact: Contact) {
    if (!contact._id) return;
    if (this.isLockedByOtherUser(contact._id)) return;
    this.socketService.lockContact(contact._id, this.userId);
    this.editingId = contact._id;
    this.editableContact = { ...contact };
  }

  cancelEdit() {
    if (this.editingId) {
      this.socketService.unlockContact(this.editingId, this.userId);
    }
    this.editingId = null;
    this.editableContact = {
      _id: '',
      name: '',
      phone: '',
      address: '',
      notes: '',
    };
  }

  saveEdit(id: string | null) {
    if (!id) return;
    const contactInput: ContactInput = {
      name: this.editableContact.name,
      phone: this.editableContact.phone,
      address: this.editableContact.address,
      notes: this.editableContact.notes
    };
    this.contactService.updateContact(id, contactInput).subscribe(() => {
      this.socketService.unlockContact(id, this.userId);
      this.editingId = null;
      this.editableContact = {
        _id: '',
        name: '',
        phone: '',
        address: '',
        notes: '',
      };
      this.loadContacts();
      this.snackBar.open('Contact updated!', 'Close', { duration: 2000 });
    });
  }

  deleteContact(id: string | undefined) {
    if (!id) {
      this.snackBar.open('Invalid contact ID', 'Close', { duration: 3000 });
      return;
    }
    if (this.isLockedByOtherUser(id)) {
      this.snackBar.open('Cannot delete: Contact is being edited by another user', 'Close', { duration: 3000 });
      return;
    }
    this.contactService.deleteContact(id).subscribe({
      next: () => {
        this.loadContacts();
        this.snackBar.open('Contact deleted successfully', 'Close', { duration: 3000 });
      },
      error: (error) => {
        this.snackBar.open('Error deleting contact', 'Close', { duration: 3000 });
        console.error('Error deleting contact:', error);
      }
    });
  }

  isLockedByOtherUser(contactId: string | undefined | null): boolean {
    if (!contactId) return false;
    return contactId in this.lockedContacts && this.lockedContacts[contactId] !== this.userId;
  }

  applyFilter() {
    this.loadContacts(1, 5, {
      name: this.searchQuery,
      phone: this.searchQuery,
      address: this.searchQuery
    });
  }

  onPageChange(event: PageEvent) {
    this.loadContacts(event.pageIndex + 1, event.pageSize, {
      name: this.searchQuery,
      phone: this.searchQuery,
      address: this.searchQuery
    });
  }

  addContact(contactInput: ContactInput) {
    this.contactService.addContact(contactInput).subscribe(() => {
      this.loadContacts();
      this.snackBar.open('Contact added!', 'Close', { duration: 2000 });
    });
  }

  logout() {
    // Implement your logout logic here
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(AddContactDialogComponent, {
      width: '400px'
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.addContact(result);
      }
    });
  }
}