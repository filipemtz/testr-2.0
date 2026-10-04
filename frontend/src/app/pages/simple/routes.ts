
import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./simple.component').then(m => m.SimpleExampleCoreUI),
    }
];

