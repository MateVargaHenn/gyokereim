import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { BlogService } from '../../core/services/blog.service';
import { CreatePostDetailsDto } from '../../shared/data-transfer-objects/create-post-details.dto';
import { HttpErrorResponse } from 'node_modules/@angular/common/types/_module-chunk';
import {
  EditorComponent,
  TINYMCE_SCRIPT_SRC
} from '@tinymce/tinymce-angular';
import { environment } from 'projects/admin/src/environments/environment';
import { FilesService } from '@admincore/services/files.service';
import { FilePicker } from '../../shared/components/file-picker/file-picker';
import { AdminFileItemDto } from '../../shared/data-transfer-objects/admin-file-item.dto';

@Component({
  selector: 'app-blog-form',
  imports: [
    ReactiveFormsModule,
    EditorComponent,
    FilePicker
  ],
  providers: [
    {
      provide: TINYMCE_SCRIPT_SRC,
      useValue: 'tinymce/tinymce.min.js'
    }
  ],
  templateUrl: './blog-form.html',
  styleUrl: './blog-form.css'
})
export class BlogForm implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly blogService = inject(BlogService);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  readonly tinyMceApiKey = environment.tinyMceApiKey;
  readonly shortSummaryEditorConfig: EditorComponent['init'] = {
    height: 250,
    menubar: true,

    plugins: [
      'lists',
      'link',
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
      'blockquote | code',
      image_title: true,

  file_picker_types: 'image',

  file_picker_callback: (
    callback,
    _value,
    meta
  ) => {
    if (meta['filetype'] !== 'image') {
      return;
    }

    this.tinyMceImageCallback =
      callback;

    this.isFilePickerOpen.set(true);
  }
  };
  isSaving = signal(false);
  error = signal<string | null>(null);

  postId: number | null = null;

  isEditMode = signal(false);
  isLoading = signal(false);
  private readonly filesService =
  inject(FilesService);

isFilePickerOpen =
  signal(false);

private tinyMceImageCallback:
  ((
    url: string,
    meta?: {
      alt?: string;
      title?: string;
    }
  ) => void)
  | null = null;

  form = this.formBuilder.nonNullable.group({
    title: [
      '',
      [
        Validators.required,
        Validators.maxLength(200)
      ]
    ],

    metaTitle: [
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

    summary: [
      '',
      Validators.required
    ],

    content: [
      '',
      Validators.required
    ],

    postTags: this.formBuilder.array([
      this.createTag()
    ]),

    postMetas: this.formBuilder.array([
      this.createMeta()
    ])
  });

  private createTag() {
    return this.formBuilder.nonNullable.group({
      name: [''],
      slug: ['']
    });
  }

  private createMeta() {
    return this.formBuilder.nonNullable.group({
      key: [''],
      value: ['']
    });
  }

  get postTags() {
    return this.form.controls.postTags;
  }

  get postMetas() {
    return this.form.controls.postMetas;
  }


  addTag(): void {
    this.postTags.push(
      this.createTag()
    );
  }

  removeTag(index: number): void {
    this.postTags.removeAt(index);
  }

  addMeta(): void {
    this.postMetas.push(
      this.createMeta()
    );
  }

  removeMeta(index: number): void {
    this.postMetas.removeAt(index);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const value = this.form.getRawValue();

    const dto: CreatePostDetailsDto = {
      title: value.title,
      metaTitle: value.metaTitle,
      slug: value.slug,
      summary: value.summary,
      content: value.content,

      postTags: value.postTags.filter(
        tag =>
          tag.name.trim() &&
          tag.slug.trim()
      ),

      postMetas: value.postMetas.filter(
        meta =>
          meta.key.trim() &&
          meta.value.trim()
      )
    };

    const request$ =
      this.isEditMode() && this.postId !== null
        ? this.blogService.updatePost(
            this.postId,
            dto
          )
        : this.blogService.createPost(dto);

    request$.subscribe({
      next: () => {
        this.router.navigate(['/admin/blog']);
      },

      error: error => {
        console.error(error);

        if (this.handleValidationErrors(error)) {
          this.isSaving.set(false);
          return;
        }

        this.error.set(
          this.isEditMode()
            ? 'Nem sikerült módosítani a bejegyzést.'
            : 'Nem sikerült létrehozni a bejegyzést.'
        );

        this.isSaving.set(false);
      }
    });
  }

  ngOnInit(): void {
    const slugControl = this.form.controls.slug;

    this.form.controls.title.valueChanges.subscribe(title => {
      if (
        !this.isEditMode() &&
        !slugControl.dirty
      ) {
        slugControl.setValue(
          this.createSlug(title),
          { emitEvent: false }
        );
      }
    });


    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      return;
    }

    const postId = Number(id);

    if (Number.isNaN(postId)) {
      this.error.set('Érvénytelen bejegyzés azonosító.');
      return;
    }

    this.postId = postId;
    this.isEditMode.set(true);

    this.loadPost(postId);
  }

  private createSlug(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private loadPost(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.blogService.getPost(id).subscribe({
      next: post => {
        this.form.patchValue({
          title: post.title,
          metaTitle: post.metaTitle,
          slug: post.slug,
          summary: post.summary,
          content: post.content
        });

        this.postTags.clear();

        for (const tag of post.postTags) {
          this.postTags.push(
            this.formBuilder.nonNullable.group({
              name: [tag.name],
              slug: [tag.slug]
            })
          );
        }

        this.postMetas.clear();

        for (const meta of post.postMetas) {
          this.postMetas.push(
            this.formBuilder.nonNullable.group({
              key: [meta.key],
              value: [meta.value]
            })
          );
        }

        this.form.markAsPristine();

        this.isLoading.set(false);
      },

      error: error => {
        console.error(error);

        this.error.set(
          'Nem sikerült betölteni a bejegyzést.'
        );

        this.isLoading.set(false);
      }
    });
  }

  private handleValidationErrors(
  error: HttpErrorResponse
): boolean {
  if (
    error.status !== 400 ||
    !error.error?.errors
  ) {
    return false;
  }

  const errors =
    error.error.errors as Record<string, string[]>;

  for (const [propertyName, messages] of Object.entries(errors)) {
    const property =
      propertyName.split('.').at(-1);

    if (!property) {
      continue;
    }

    const controlName =
      property.charAt(0).toLowerCase() +
      property.slice(1);

    const control = this.form.get(controlName);

    if (!control) {
      continue;
    }

    control.setErrors({
      ...control.errors,
      server: messages[0]
    });

    control.markAsTouched();
  }

  return true;
}

selectFile(
  file: AdminFileItemDto
): void {
  if (!this.tinyMceImageCallback) {
    return;
  }

  const url =
    this.filesService
      .getPublicFileUrl(file.key);

  this.tinyMceImageCallback(
    url,
    {
      alt:
        file.altText ??
        file.title ??
        file.fileName,

      title:
        file.title ??
        file.fileName
    }
  );

  this.tinyMceImageCallback = null;
  this.isFilePickerOpen.set(false);
}
closeFilePicker(): void {
  this.tinyMceImageCallback = null;

  this.isFilePickerOpen.set(false);
}
}