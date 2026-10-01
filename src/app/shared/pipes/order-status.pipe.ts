import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'OrderStatus',
    pure: true,
    standalone: true
})
export class OrderStatusPipe implements PipeTransform {
    transform(value: string): string {
        switch (value) {
            case 'Created':
                return 'Rendelés létrehozva. Várakozás a feldolgozásra.';
            case 'Consultation':
                return 'Konzultáció folyamatban. Hamarosan felveszem Önnel a kapcsolatot.';
            case 'InProgress':
                return 'Folyamatban. Dolgozom a megrendelésén.';
            case 'Completed':
                return 'Elkészült. A megrendelés teljesítve.';
            case 'Storno':
                return 'Törölve';
            default:
                return 'Ismeretlen';
        }
    }
}