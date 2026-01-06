import { Routes } from '@angular/router';
import { ConverterComponent } from './converter';

export const routes: Routes = [
    { path: '', component: ConverterComponent },
    { path: '**', redirectTo: '' }
];
