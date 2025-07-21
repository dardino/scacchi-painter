import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-privacy-and-terms',
  imports: [MatSelectModule, MatFormFieldModule],
  standalone: true,
  templateUrl: './privacy-and-terms.component.html',
  styleUrl: './privacy-and-terms.component.less'
})
export class PrivacyAndTermsComponent {

}
