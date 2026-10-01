import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  signal
} from '@angular/core';

import { DatePipe } from '@angular/common';

import { FilesService } from '@admincore/services/files.service';
import { AdminFileItemDto } from '../../shared/data-transfer-objects/admin-file-item.dto';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-files',
  imports: [
    DatePipe,
    ReactiveFormsModule
  ],
  templateUrl: './files.html',
  styleUrl: './files.css',
})
export class Files implements OnInit, OnDestroy {

  private readonly filesService =
    inject(FilesService);

  files =
    signal<AdminFileItemDto[]>([]);

  readonly imagePreviews =
    signal<Record<number, string>>({});

  isLoading =
    signal(true);

  isUploading =
    signal(false);

  error =
    signal<string | null>(null);

  editingFile =
  signal<AdminFileItemDto | null>(null);

isSavingMetadata =
  signal(false);

  private readonly formBuilder =
  inject(FormBuilder);

metadataForm =
  this.formBuilder.nonNullable.group({
    title: [''],
    altText: ['']
  });

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.filesService
      .getFiles()
      .subscribe({
next: files => {
  this.clearImagePreviews();

  this.files.set(files);

  this.loadImagePreviews(files);

  this.isLoading.set(false);
},

        error: error => {
          console.error(error);

          this.error.set(
            'Nem sikerült betölteni a fájlokat.'
          );

          this.isLoading.set(false);
        }
      });
  }

  onFileSelected(
    event: Event
  ): void {
    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (!file) {
      return;
    }

    this.uploadFile(file);

    input.value = '';
  }

  private uploadFile(
    file: File
  ): void {
    this.isUploading.set(true);
    this.error.set(null);

    this.filesService
      .uploadFile(file)
      .subscribe({
        next: () => {
          this.isUploading.set(false);
          this.loadFiles();
        },

        error: error => {
          console.error(error);

          this.error.set(
            'Nem sikerült feltölteni a fájlt.'
          );

          this.isUploading.set(false);
        }
      });
  }

  publishFile(
    file: AdminFileItemDto
  ): void {
    this.filesService
      .publishFile(file.id)
      .subscribe({
        next: () => {
          this.loadFiles();
        },

        error: error => {
          console.error(error);

          this.error.set(
            'Nem sikerült publikálni a fájlt.'
          );
        }
      });
  }

  unpublishFile(
    file: AdminFileItemDto
  ): void {
    this.filesService
      .unpublishFile(file.id)
      .subscribe({
        next: () => {
          this.loadFiles();
        },

        error: error => {
          console.error(error);

          this.error.set(
            'Nem sikerült priváttá tenni a fájlt.'
          );
        }
      });
  }

  isImage(
    file: AdminFileItemDto
  ): boolean {
    return file.contentType
      .startsWith('image/');
  }

  formatFileSize(
    bytes: number
  ): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    const kilobytes =
      bytes / 1024;

    if (kilobytes < 1024) {
      return `${kilobytes.toFixed(1)} KB`;
    }

    const megabytes =
      kilobytes / 1024;

    return `${megabytes.toFixed(1)} MB`;
  }

  editFile(
  file: AdminFileItemDto
): void {
  this.editingFile.set(file);

  this.metadataForm.setValue({
    title: file.title ?? '',
    altText: file.altText ?? ''
  });
}

closeEditModal(): void {
  this.editingFile.set(null);
}

saveMetadata(): void {
  const file =
    this.editingFile();

  if (!file) {
    return;
  }

  const value =
    this.metadataForm.getRawValue();

  this.isSavingMetadata.set(true);
  this.error.set(null);

  this.filesService
    .updateMetadata(
      file.id,
      {
        title: value.title || null,
        altText: value.altText || null
      }
    )
    .subscribe({
      next: () => {
        this.isSavingMetadata.set(false);
        this.editingFile.set(null);

        this.loadFiles();
      },

      error: error => {
        console.error(error);

        this.error.set(
          'Nem sikerült menteni a fájl adatait.'
        );

        this.isSavingMetadata.set(false);
      }
    });
}

private loadImagePreviews(
  files: AdminFileItemDto[]
): void {
  for (const file of files) {

    if (!this.isImage(file)) {
      continue;
    }

    this.filesService
      .getAdminFile(file.id)
      .subscribe({
        next: blob => {
          const url =
            URL.createObjectURL(blob);

          this.imagePreviews.update(
            previews => ({
              ...previews,
              [file.id]: url
            })
          );
        },

        error: error => {
          console.error(
            `Nem sikerült betölteni a(z) ${file.fileName} előnézetét.`,
            error
          );
        }
      });
  }
}

private clearImagePreviews(): void {
  const previews =
    this.imagePreviews();

  for (const url of Object.values(previews)) {
    URL.revokeObjectURL(url);
  }

  this.imagePreviews.set({});
}

ngOnDestroy(): void {
  this.clearImagePreviews();
}

}