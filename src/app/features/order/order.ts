import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ServicesService } from '@core/services/services.service';
import { OrderDto } from '@shared/data-transfer-objects/order.dto';
import { ServiceDto } from '@shared/data-transfer-objects/service.dto';

@Component({
  selector: 'app-order',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class Order {
  private route = inject(ActivatedRoute);
  services = inject(ServicesService);
  service$: WritableSignal<ServiceDto | undefined> = signal(undefined);
  isLoading = signal(true);
  slug: string = '';
  FormBuilder = inject(FormBuilder);
  submitted: WritableSignal<boolean> = signal(false);
  serverError: WritableSignal<boolean> = signal(false);
  protected orderFormGroup = new FormGroup({
  customerName: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100)
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

  phoneNumber: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.pattern(/^\+?[0-9\s()-]{7,20}$/)
    ]
  }),

  message: new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.maxLength(2000)
    ]
  }),

  acceptTerms: new FormControl(false, {
    nonNullable: true,
    validators: [
      Validators.requiredTrue
    ]
  })
});
  error = signal<string | null>(null);
  
    ngOnInit(): void {
      this.slug = this.route.snapshot.paramMap.get('slug')!;
      
      this.services.getServiceBySlug(this.slug ?? '').subscribe({
        next: (data: ServiceDto | undefined) => {
          this.service$.set(data);
          this.isLoading.set(false);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.error.set('Váratlan hiba: ' + error);
          console.error('Error fetching service details:', error);
        },
      });
    }

    onSubmit(): void {
      if (this.orderFormGroup.valid) {
        const formData = this.orderFormGroup.value;
        const orderDto = formData as OrderDto;
        orderDto.serviceKey = this.slug;
        this.services.sendOrder(orderDto).subscribe({
          next: () => {
            this.submitted.set(true);
          },
          error: () => {
            this.serverError.set(true);
          }
        })
        // Here you can send the form data to your backend or perform any other action
      } else {
        console.error('Form is invalid');
      }
    }
}
