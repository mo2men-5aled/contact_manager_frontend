import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LockSocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('https://contact-manager-backend-5q64.onrender.com');
  }

  lockContact(contactId: string, username: string) {
    this.socket.emit('lock_contact', { contactId, username });
  }

  unlockContact(contactId: string, username: string) {
    this.socket.emit('unlock_contact', { contactId, username });
  }

  onContactLocked(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('contact_locked', data => observer.next(data));
    });
  }

  onContactUnlocked(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('contact_unlocked', data => observer.next(data));
    });
  }

  onLockError(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('contact_locked_error', data => observer.next(data));
    });
  }
}
