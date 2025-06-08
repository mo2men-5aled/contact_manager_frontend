import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.socketUrl); // make sure this is your backend socket URL
  }

  lockContact(contactId: string, username: string) {
    this.socket.emit('lock_contact', { contactId, username });
  }

  unlockContact(contactId: string, username: string) {
    this.socket.emit('unlock_contact', { contactId, username });
  }

  onContactLocked(): Observable<{ contactId: string; userId: string }> {
    return new Observable(observer => {
      this.socket.on('contact_locked', data => observer.next(data));
    });
  }

  onLockError(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('contact_locked_error', data => observer.next(data));
    });
  }

  onContactUnlocked(): Observable<{ contactId: string }> {
    return new Observable(observer => {
      this.socket.on('contact_unlocked', data => observer.next(data));
    });
  }
}
