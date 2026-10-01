import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServicesService } from '@core/services/services.service';
import { TrackOrderDto } from '@shared/data-transfer-objects/track-order.dto';
import { OrderStatusPipe } from "../../shared/pipes/order-status.pipe";

@Component({
  selector: 'app-tracking',
  imports: [ReactiveFormsModule, OrderStatusPipe],
  templateUrl: './tracking.html',
  styleUrl: './tracking.css',
})
export class Tracking {
  activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  isLoading = signal(false);
  services = inject(ServicesService);
  order$ = signal<TrackOrderDto | undefined>(undefined);
  protected trackingForm: FormGroup = new FormGroup({
    tracknumber: new FormControl('', {
          nonNullable: true,
          validators: [
            Validators.required,
          ]
    }),
    email: new FormControl('', {
          nonNullable: true,
    validators: [
      Validators.required,
      Validators.email,
      Validators.maxLength(255)
    ]
    }),
  });

  constructor() {
    this.trackingForm.controls['tracknumber'].setValue(this.activatedRoute.snapshot.paramMap.get('tracknumber') ?? '');
    this.trackingForm.controls['email'].setValue(this.activatedRoute.snapshot.paramMap.get('email') ?? '');
  }
  onSubmit() {
    this.isLoading.set(true);
    const form = this.trackingForm.value;
    this.services.trackOrderByTrackNumber(form['tracknumber'], form['email']).subscribe({
      next: (order: TrackOrderDto | undefined) => {
        if (order) {
          this.order$.set(order);
        } else {
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching order:', error);
        this.isLoading.set(false);
      }
    });
  }
}
