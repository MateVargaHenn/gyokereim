import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import { ServicesService } from '@admincore/services/services.service';
import { CreateServiceDto } from '../../shared/data-transfer-objects/create-service.dto';
import {
  EditorComponent,
  TINYMCE_SCRIPT_SRC
} from '@tinymce/tinymce-angular';
import { environment } from 'projects/admin/src/environments/environment';

@Component({
  selector: 'app-service-form',
  imports: [
    ReactiveFormsModule,
    EditorComponent
  ],
  providers: [
    {
      provide: TINYMCE_SCRIPT_SRC,
      useValue: 'tinymce/tinymce.min.js'
    }
  ],
  templateUrl: './service-form.html',
  styleUrl: './service-form.css',
})
export class ServiceForm {

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly servicesService =
    inject(ServicesService);

  private readonly route =
    inject(ActivatedRoute);

  readonly router =
    inject(Router);

    readonly tinyMceApiKey = environment.tinyMceApiKey;
      readonly shortSummaryEditorConfig: EditorComponent['init'] = {
        height: 250,
        menubar: true,
    
        plugins: [
          'lists',
          'link',
          'image',
          'table',
          'code',
          'wordcount'
        ],
    
        toolbar:
          'undo redo | blocks | ' +
          'bold italic underline | ' +
          'alignleft aligncenter alignright | ' +
          'bullist numlist | ' +
          'link image table | ' +
          'blockquote | code'
      };
      readonly contentEditorConfig: EditorComponent['init'] = {
        height: 600,
        menubar: true,
    
        plugins: [
          'lists',
          'link',
          'image',
          'table',
          'code',
          'wordcount'
        ],
    
        toolbar:
          'undo redo | blocks | ' +
          'bold italic underline | ' +
          'alignleft aligncenter alignright | ' +
          'bullist numlist | ' +
          'link image table | ' +
          'blockquote | code'
      };

  serviceId: number | null = null;

  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);

  form = this.formBuilder.nonNullable.group({
    name: [
      '',
      Validators.required
    ],

    shortDescription: [
      '',
      Validators.required
    ],

    description: [
      '',
      Validators.required
    ],

    slug: [
      '',
      [
        Validators.required,
        Validators.pattern(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/
        )
      ]
    ],

    price: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    orderNumber: [
      0,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],
    serviceStatusCode: [
      1,
      Validators.required
    ]
  });

  ngOnInit(): void {
    this.initializeSlugGeneration();
    
    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    const serviceId = Number(id);

    if (Number.isNaN(serviceId)) {
      this.error.set(
        'Érvénytelen szolgáltatás azonosító.'
      );

      return;
    }

    this.serviceId = serviceId;
    this.isEditMode.set(true);

    this.loadService(serviceId);
  }

  private loadService(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.servicesService
      .getService(id)
      .subscribe({
        next: service => {
          this.form.patchValue({
            name: service.name,
            shortDescription:
              service.shortDescription,
            description:
              service.description,
            slug: service.slug,
            price: service.price,
            orderNumber: service.orderNumber,
            serviceStatusCode:
              service.serviceStatusCode
          });

          this.form.markAsPristine();

          this.isLoading.set(false);
        },

        error: error => {
          console.error(error);

          this.error.set(
            'Nem sikerült betölteni a szolgáltatást.'
          );

          this.isLoading.set(false);
        }
      });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const value =
      this.form.getRawValue();

    const dto: CreateServiceDto = {
      name: value.name,
      shortDescription:
        value.shortDescription,
      description:
        value.description,
      slug: value.slug,
      price: value.price,
      orderNumber: value.orderNumber,
      serviceStatusCode:
        value.serviceStatusCode
    };

    const request$ =
      this.isEditMode() &&
      this.serviceId !== null
        ? this.servicesService.updateService(
            this.serviceId,
            dto
          )
        : this.servicesService.createService(
            dto
          );

    request$.subscribe({
      next: () => {
        this.router.navigate([
          '/admin/szolgaltatasok'
        ]);
      },

      error: error => {
        console.error(error);

        this.error.set(
          this.isEditMode()
            ? 'Nem sikerült módosítani a szolgáltatást.'
            : 'Nem sikerült létrehozni a szolgáltatást.'
        );

        this.isSaving.set(false);
      }
    });
  }

  private initializeSlugGeneration(): void {
  this.form.controls.name.valueChanges
    .subscribe(name => {

      if (
        this.isEditMode() ||
        this.form.controls.slug.dirty
      ) {
        return;
      }

      this.form.controls.slug.setValue(
        this.slugify(name),
        {
          emitEvent: false
        }
      );
    });
}

private slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
}