import { Service } from '@angular/core';
import { Api } from './api/api';
import { ServiceDto } from '@shared/data-transfer-objects/service.dto';
import { Observable } from 'rxjs';
import { OrderDto } from '@shared/data-transfer-objects/order.dto';
import { TrackOrderDto } from '@shared/data-transfer-objects/track-order.dto';

@Service()
export class ServicesService extends Api {
    getServices(): Observable<ServiceDto[] | undefined> {
        return this.get<ServiceDto[]>('services/get');
    }

    getServiceBySlug(slug: string): Observable<ServiceDto | undefined> {
        return this.get<ServiceDto>(`services/${slug}`);
    }

    sendOrder(orderData: OrderDto): Observable<any> {
        return this.post<any>('services/order', orderData);
    }

    trackOrderByTrackNumber(trackNumber: string, email: string): Observable<TrackOrderDto | undefined> {
        return this.get<TrackOrderDto>(`services/track-order/${trackNumber}/${email}`);
    }
}
