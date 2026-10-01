import { Component, input } from '@angular/core';
@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  title = input<string>('Default Title');
  message = input<string>('Example message');
}
