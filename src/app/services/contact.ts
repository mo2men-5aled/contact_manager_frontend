// src/services/contact.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Contact {
  _id?: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
}

export interface ContactListResponse {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private baseUrl = 'https://contact-manager-backend-5q64.onrender.com/api/contacts';

  constructor(private http: HttpClient) {}

  getContacts(
    page: number = 1,
    limit: number = 5,
    filters: { name?: string; phone?: string; address?: string } = {}
  ): Observable<ContactListResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.name) params = params.set('name', filters.name);
    if (filters.phone) params = params.set('phone', filters.phone);
    if (filters.address) params = params.set('address', filters.address);

    return this.http.get<ContactListResponse>(this.baseUrl, { params });
  }

  addContact(contact: Contact): Observable<any> {
    return this.http.post(this.baseUrl, contact);
  }

  updateContact(id: string, contact: Contact): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, contact);
  }

  deleteContact(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
