import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import QuillResize from 'quill-resize-module';
import Quill from 'quill/core/quill';

@Component({
  selector: 'app-blog-editor',
  imports: [FormsModule, ReactiveFormsModule, QuillModule],
  templateUrl: './blog-editor.html',
  styleUrl: './blog-editor.css',
})
export class BlogEditor {
  private editor?: Quill;
  htmlMode = false;
  htmlSource = '';
  content = new FormControl('');
    readonly customModules = [
    {
      path: 'modules/resize',
      implementation: QuillResize
    }
  ];

  readonly editorModules = {
    toolbar: [
      // [{ header: [2, 3, 4, false] }],
      // ['bold', 'italic', 'underline'],
      // [{ list: 'ordered' }, { list: 'bullet' }],
      // ['blockquote', 'link', 'image', 'video'],
      // ['clean']

      
            // Címsor
            [{ header: [1, 2, 3, 4, false] }],

            // Betűtípus és méret
            [{ font: [] }],
            [{ size: ['small', false, 'large', 'huge'] }],

            // Alapformázások
            ['bold', 'italic', 'underline', 'strike'],

            // Színek
            [{ color: [] }, { background: [] }],

            // Alsó és felső index
            [{ script: 'sub' }, { script: 'super' }],

            // Listák
            [{ list: 'ordered' }, { list: 'bullet' }],

            // Behúzás
            [{ indent: '-1' }, { indent: '+1' }],

            // Igazítás
            [{ align: [] }],

            // Speciális blokkok
            ['blockquote', 'code-block'],

            // Beágyazások
            ['link', 'image', 'video'],

            // Formázás törlése
            ['clean']
    ],

    resize: {
      modules: ['DisplaySize', 'Toolbar', 'Resize', 'Keyboard'],
      embedTags: ['IFRAME', 'VIDEO', 'IMG'],

      parchment: {
        image: {
          attribute: ['width'],
          limit: {
            minWidth: 100,
            maxWidth: 900
          }
        },
        video: {
          attribute: ['width', 'height'],
          limit: {
            minWidth: 240,
            ratio: 0.5625
          }
        }
      }
    }
  };
  onEditorCreated(editor: Quill): void {
    this.editor = editor;
  }
  openHtmlView(): void {
    if (!this.content.value) {
      return;
    }

    this.htmlSource = this.editor?.getSemanticHTML() || '';
    this.htmlMode = true;
  }
    applyHtml(): void {
    if (!this.editor) {
      return;
    }

    this.editor.clipboard.dangerouslyPasteHTML(
      this.htmlSource,
      'api'
    );

    this.htmlMode = false;
  }

  cancelHtmlView(): void {
    this.htmlMode = false;
  }
}
