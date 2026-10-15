import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import {
  EditorComponent,
  TINYMCE_SCRIPT_SRC
} from '@tinymce/tinymce-angular';

import { environment } from 'projects/admin/src/environments/environment';
import { WebSettingsService } from '../../core/services/web-settings.service';

@Component({
  selector: 'app-web-settings',
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
  styleUrl: './web-settings.css',
  templateUrl: './web-settings.html',
})
export class WebSettings implements OnInit {

  private readonly formBuilder = inject(FormBuilder);
  private readonly webSettingsService = inject(WebSettingsService);

  readonly tinyMceApiKey = environment.tinyMceApiKey;

  readonly shortEditorConfig: EditorComponent['init'] = {
    height: 220,
    menubar: false,

    plugins: [
      'link',
      'wordcount'
    ],

    toolbar:
      'undo redo | ' +
      'bold italic | ' +
      'link'
  };

  readonly detailedEditorConfig: EditorComponent['init'] = {
    height: 500,
    menubar: false,

    plugins: [
      'lists',
      'link',
      'wordcount'
    ],

    toolbar:
      'undo redo | blocks | ' +
      'bold italic underline | ' +
      'bullist numlist | ' +
      'link | blockquote'
  };

  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    introduceTitle: [
      '',
      Validators.required
    ],

    introduceSubtitle: [''],

    introduceShort: [''],

    introduce: [''],

    introduceQuote: [''],

    introduceImage: ['']
  });

  ngOnInit(): void {
    this.loadSettings();
  }

  private loadSettings(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.webSettingsService
      .getWebSettings()
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: settings => {
          const values = new Map(
            settings.map(setting => [
              setting.key,
              setting.value
            ])
          );

          this.form.patchValue({
            introduceTitle:
              values.get('introduce_title') ?? '',

            introduceSubtitle:
              values.get('introduce_subtitle') ?? '',

            introduceShort:
              values.get('introduce_short') ?? '',

            introduce:
              values.get('introduce') ?? '',

            introduceQuote:
              values.get('introduce_quote') ?? '',

            introduceImage:
              values.get('introduce_image') ?? ''
          });

          this.form.markAsPristine();
        },

        error: error => {
          console.error(error);

          this.error.set(
            'A web beállítások betöltése nem sikerült.'
          );
        }
      });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);
    this.success.set(null);

    const value = this.form.getRawValue();

    forkJoin([
      this.webSettingsService.updateWebSetting(
        'introduce_title',
        {
          value: value.introduceTitle
        }
      ),

      this.webSettingsService.updateWebSetting(
        'introduce_subtitle',
        {
          value: value.introduceSubtitle
        }
      ),

      this.webSettingsService.updateWebSetting(
        'introduce_short',
        {
          value: value.introduceShort
        }
      ),

      this.webSettingsService.updateWebSetting(
        'introduce',
        {
          value: value.introduce
        }
      ),

      this.webSettingsService.updateWebSetting(
        'introduce_quote',
        {
          value: value.introduceQuote
        }
      ),

      this.webSettingsService.updateWebSetting(
        'introduce_image',
        {
          value: value.introduceImage
        }
      )
    ])
      .pipe(
        finalize(() => this.isSaving.set(false))
      )
      .subscribe({
        next: () => {
          this.success.set(
            'A web beállítások mentése sikerült.'
          );

          this.form.markAsPristine();
        },

        error: error => {
          console.error(error);

          this.error.set(
            'A web beállítások mentése nem sikerült.'
          );
        }
      });
  }
}