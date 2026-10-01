import {
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  output,
  signal
} from '@angular/core';

import { FilesService } from '@admincore/services/files.service';
import { AdminFileItemDto } from '../../data-transfer-objects/admin-file-item.dto';

@Component({
  selector: 'app-file-picker',
  imports: [],
  templateUrl: './file-picker.html',
  styleUrl: './file-picker.css'
})
export class FilePicker implements OnInit, OnDestroy {

  private readonly filesService =
    inject(FilesService);

  readonly imagesOnly =
    input(false);

  readonly publicOnly =
    input(true);

  readonly selected =
    output<AdminFileItemDto>();

  readonly closed =
    output<void>();

  readonly files =
    signal<AdminFileItemDto[]>([]);

  readonly imagePreviews =
    signal<Record<number, string>>({});

  readonly isLoading =
    signal(true);

  readonly error =
    signal<string | null>(null);

  readonly visibleFiles = computed(() => {
    let files = this.files();

    if (this.publicOnly()) {
      files = files.filter(
        file => file.isPublic
      );
    }

    if (this.imagesOnly()) {
      files = files.filter(
        file =>
          file.contentType.startsWith('image/')
      );
    }

    return files;
  });

  ngOnInit(): void {
    this.loadFiles();
  }

  ngOnDestroy(): void {
    this.clearImagePreviews();
  }

  selectFile(
    file: AdminFileItemDto
  ): void {
    this.selected.emit(file);
  }

  close(): void {
    this.closed.emit();
  }

  private loadFiles(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.filesService
      .getFiles()
      .subscribe({
        next: files => {
          this.files.set(files);

          this.loadImagePreviews(
            files.filter(
              file =>
                file.contentType.startsWith(
                  'image/'
                )
            )
          );

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

  private loadImagePreviews(
    files: AdminFileItemDto[]
  ): void {
    for (const file of files) {
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
              `Nem sikerült betölteni a fájl előnézetét: ${file.fileName}`,
              error
            );
          }
        });
    }
  }

  private clearImagePreviews(): void {
    for (
      const url
      of Object.values(
        this.imagePreviews()
      )
    ) {
      URL.revokeObjectURL(url);
    }

    this.imagePreviews.set({});
  }
}