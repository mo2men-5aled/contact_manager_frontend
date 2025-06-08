export class Contact {
  _id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;

  constructor(data: Partial<Contact> = {}) {
    this._id = data._id || '';
    this.name = data.name || '';
    this.phone = data.phone || '';
    this.address = data.address || '';
    this.notes = data.notes || '';
  }
}
