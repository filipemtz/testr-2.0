import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';

import { IconDirective } from '@coreui/icons-angular';
import { IconSetService } from '@coreui/icons-angular';
import { freeSet } from '@coreui/icons';

import {
    ContainerComponent,
    ShadowOnScrollDirective,
    SidebarBrandComponent,
    SidebarComponent,
    SidebarFooterComponent,
    SidebarHeaderComponent,
    SidebarNavComponent,
    SidebarToggleDirective,
    SidebarTogglerDirective
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from '.';
import { navItems } from './_nav';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

function isOverflown(element: HTMLElement) {
    return (
        element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth
    );
}

@Component({
    selector: 'app-dashboard',
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './default-layout.component.html',
    styleUrls: ['./default-layout.component.scss'],
    imports: [
        SidebarComponent,
        SidebarHeaderComponent,
        SidebarBrandComponent,
        SidebarNavComponent,
        SidebarFooterComponent,
        SidebarToggleDirective,
        SidebarTogglerDirective,
        ContainerComponent,
        DefaultFooterComponent,
        DefaultHeaderComponent,
        IconDirective,
        NgScrollbar,
        RouterOutlet,
        RouterLink,
        ShadowOnScrollDirective,
        ConfirmModalComponent

    ]
})
export class DefaultLayoutComponent {
    public navItems = [...navItems];

    constructor(public iconSet: IconSetService) {
        iconSet.icons = { ...freeSet };
    }
}
