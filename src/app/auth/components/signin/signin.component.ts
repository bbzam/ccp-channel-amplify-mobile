import { Component } from '@angular/core';
import { TodosComponent } from '../../../todos/todos.component';
import { Amplify } from 'aws-amplify';
import outputs from '../../../../../amplify_outputs.json'
import { AmplifyAuthenticatorModule, AuthenticatorService } from '@aws-amplify/ui-angular';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [TodosComponent, AmplifyAuthenticatorModule],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent  {
    
  constructor(public authenticator: AuthenticatorService) {
    Amplify.configure(outputs);
  }
}