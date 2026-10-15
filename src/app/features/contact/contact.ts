import { Component, inject, signal, WritableSignal, afterNextRender } from '@angular/core';
import { SeoService } from '@core/services/seo-service';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { SendContactMessageRequestDto } from '@shared/data-transfer-objects/send-contact-message-request.dto';
import { ContactService } from '@core/services/contact.service';
import { environment } from 'src/environments/environment.development';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {


  protected contactFormGroup = new FormGroup({
    topic: new FormControl<'general' | 'package_selection'>('general', { nonNullable: true }),
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phoneNumber: new FormControl('', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]),
    message: new FormControl('', [Validators.required]),
    attachment: new FormControl(''),
    captchaToken: new FormControl('', [Validators.required]),
  });
  contactService = inject(ContactService);
  submitted: WritableSignal<boolean> = signal(false);
  serverError: WritableSignal<boolean> = signal(false);
  protected attachment?: File;
  protected captchaToken = '';
  private turnstileWidgetId?: string;
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly seoService = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  protected readonly isPackageSelection = signal(false);

  constructor() {
    
    this.title.setTitle('Családfakutatás, családtörténet – Kapcsolat | Gyökereim');
    this.meta.updateTag({
      name: 'description',
      content: 'Bánfi Zoltán Csaba családfakutató, a Gyökereim blog szerzője. Családfakutatás, genealógia, családtörténet, családi örökség és hagyományok. Lépjen kapcsolatba velem, ha kérdése van, vagy szeretne többet megtudni a szolgáltatásaimról.'
    });
    
    this.seoService.setCanonical(
      'https://gyokereim.hu/kapcsolat'
    );
    const isPackageSelection =
      this.route.snapshot.queryParamMap.get('tema') === 'csomagvalasztas';

    this.isPackageSelection.set(isPackageSelection);

    this.contactFormGroup.controls.topic.setValue(
      isPackageSelection ? 'package_selection' : 'general'
    );
    afterNextRender(() => {
      this.renderTurnstile();
    });
  }


  onSubmit(): void {
    if (this.contactFormGroup.valid) {
      // Handle form submission logic here
      const formData = this.contactFormGroup.value as SendContactMessageRequestDto;
      this.contactService.sendContactForm(formData, this.attachment).subscribe({
        next: (response) => {
          this.submitted.set(true);
          this.contactFormGroup.reset();
          if (this.turnstileWidgetId) {
            window.turnstile.reset(this.turnstileWidgetId);
          }
          this.contactFormGroup.controls.topic.setValue(
            this.isPackageSelection() ? 'package_selection' : 'general'
          );
          this.captchaToken = '';
        },
        error: (error) => {
          this.serverError.set(true);
        }
      });
    } else {
      // Mark all controls as touched to trigger validation messages
      this.contactFormGroup.markAllAsTouched();
    }
  }

protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.attachment = input.files?.[0];
}

private renderTurnstile(): void {
  this.turnstileWidgetId = window.turnstile.render(
    '#turnstile-container',
    {
      sitekey: environment.turnstileSiteKey,

      callback: (token: string) => {
        this.contactFormGroup.controls.captchaToken.setValue(token);
      },

      'expired-callback': () => {
        this.contactFormGroup.controls.captchaToken.setValue('');
      },

      'error-callback': () => {
        this.contactFormGroup.controls.captchaToken.setValue('');
      }
    }
  );
}
}

declare global {
  interface Window {
    turnstile: {
      render: (
        selector: string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
        }
      ) => string;

      reset: (widgetId: string) => void;
    };
  }
}
