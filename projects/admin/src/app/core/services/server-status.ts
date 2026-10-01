import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ServerStatus {
    private readonly _available = signal(true);

    readonly available = this._available.asReadonly();

    setAvailable(available: boolean): void {
        this._available.set(available);
    }
}
