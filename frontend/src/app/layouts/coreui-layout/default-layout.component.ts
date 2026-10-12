import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NgScrollbar } from 'ngx-scrollbar';

import { IconDirective } from '@coreui/icons-angular';
import { IconSetService } from '@coreui/icons-angular';
import { freeSet } from '@coreui/icons';

import {
    ContainerComponent,
    NavItemComponent,
    NavLinkDirective,
    NavTitleComponent,
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
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { UiPreferencesService } from '../../services/ui-preferences.service';
import { SideBarService } from './sidebar.service';

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
        NavItemComponent,
        NavTitleComponent,
        NavLinkDirective,
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
    protected readonly sidebar_service = inject(SideBarService);
    protected readonly ui_preferences_service = inject(UiPreferencesService);
    public courses = this.sidebar_service.courses;
    readonly icons = { ...freeSet };
}
