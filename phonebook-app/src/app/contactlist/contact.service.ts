import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {throwError, Observable, catchError, of} from 'rxjs';
import { Contact } from './contact';

@Injectable({
  providedIn: 'root' // сервис регистрируется автоматически
})
export class ContactService {
  private APIUrl = '/v1/contact'; // базовый путь API

  constructor(private http: HttpClient) {}

  // создание нового контакта
  createContact(newContact: Contact): Observable<Contact> {
    return this.http.post<Contact>(this.APIUrl, newContact)
      .pipe(
        catchError(this.handleError<Contact>('createContact'))
      );
  }

  // получение всех контактов
  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(this.APIUrl)
      .pipe(
        catchError(this.handleError<Contact[]>('getContacts', []))
      );
  }

  // удаление контакта по id
  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.APIUrl}/${id}`)
      .pipe(
        catchError(this.handleError<void>('deleteContact'))
      );
  }

  // обновление контакта
  updateContact(contact: Contact): Observable<Contact> {
    return this.http.put<Contact>(`${this.APIUrl}/${contact._id}`, contact)
      .pipe(
        catchError(this.handleError<Contact>('updateContact'))
      );
  }

  // универсальная обработка ошибок
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      // Если передан результат — возвращаем Observable с ним, иначе — выбрасываем ошибку
      return result !== undefined ? of(result) : throwError(() => error);
    };
  }
}
