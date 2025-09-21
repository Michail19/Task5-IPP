export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: {
    work: string;
    mobile: string;
  };
}
