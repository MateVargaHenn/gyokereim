import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GuidGenerator {
    static standard(): string {
    return 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/[x]/g, c => {
      const r: number = Math.random() * 16 | 0;
      const v: number = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16).toUpperCase();
    });
  }
}
