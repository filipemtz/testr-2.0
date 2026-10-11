
import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

import { IconDirective } from '@coreui/icons-angular';
import { IconSetService } from '@coreui/icons-angular';
import { freeSet } from '@coreui/icons';

import { TestrStore } from '../../../services/testr.store';


import { BreadcrumbComponent, BreadcrumbItemComponent, ButtonDirective } from '@coreui/angular';

import {
    AvatarComponent,
    BadgeComponent,
    BreadcrumbRouterComponent,
    ColorModeService,
    ContainerComponent,
    DropdownComponent,
    DropdownDividerDirective,
    DropdownHeaderDirective,
    DropdownItemDirective,
    DropdownMenuDirective,
    DropdownToggleDirective,
    FormControlDirective,
    HeaderComponent,
    HeaderNavComponent,
    HeaderTogglerDirective,
    ListGroupDirective,
    ListGroupItemDirective,
    ModalBodyComponent,
    ModalComponent,
    ModalHeaderComponent,
    ModalTitleDirective,
    NavLinkDirective,
    SearchButtonComponent,
    SidebarToggleDirective,
} from '@coreui/angular';

import { RoleSwitcherComponent } from '../../../components/role-switcher/role-switcher.component';
import { BreadcrumbsService, BreadCrumbItem } from '../../../components/breadcrumbs/breadcrumb.service';
import { UiPreferencesService } from '../../../services/ui-preferences.service';
import { notify_error } from '../../../utils/notifications';

@Component({
    selector: 'app-default-header',
    templateUrl: './default-header.component.html',
    imports: [
        AvatarComponent,
        BadgeComponent,
        BreadcrumbRouterComponent,
        ContainerComponent,
        DropdownComponent,
        DropdownDividerDirective,
        DropdownHeaderDirective,
        DropdownItemDirective,
        DropdownMenuDirective,
        DropdownToggleDirective,
        FormControlDirective,
        HeaderNavComponent,
        HeaderTogglerDirective,
        IconDirective,
        ListGroupDirective,
        ListGroupItemDirective,
        ModalBodyComponent,
        ModalComponent,
        ModalHeaderComponent,
        ModalTitleDirective,
        NavLinkDirective,
        NgTemplateOutlet,
        RouterLink,
        SearchButtonComponent,
        SidebarToggleDirective,
        RoleSwitcherComponent,
        BreadcrumbComponent,
        BreadcrumbItemComponent,
        ButtonDirective
    ]
})
export class DefaultHeaderComponent extends HeaderComponent implements OnInit {
    protected readonly ui_preferences_service = inject(UiPreferencesService);
    protected readonly store = inject(TestrStore);
    readonly #colorModeService = inject(ColorModeService);
    readonly colorMode = this.#colorModeService.colorMode;

    readonly breadcrumbs = inject(BreadcrumbsService).get_breadcrumbs();

    readonly colorModes = [
        { name: 'light', text: 'Light', icon: 'cilSun' },
        { name: 'dark', text: 'Dark', icon: 'cilMoon' },
        //{ name: 'auto', text: 'Auto', icon: 'cilContrast' }
    ];

    readonly icons = computed(() => {
        const currentMode = this.colorMode();
        return this.colorModes.find(mode => mode.name === currentMode)?.icon ?? 'cilSun';
    });

    constructor(
        public iconSet: IconSetService,
        private authService: AuthService,
        private router: Router,
    ) {
        super();
        iconSet.icons = { ...freeSet };
    }

    readonly sidebarId = input('sidebar1');
    readonly searchVisible = signal(false);
    protected user: any | null = null;
    readonly isProfessor = signal(false);

    ngOnInit(): void {
        // TODO: these API calls are unnecessary are all over the place
        this.authService.profile().subscribe({
            next: (response) => {
                this.user = response;
                // TODO: these API calls are unnecessary are all over the place (also in other components)
                this.authService.userInfo().subscribe({
                    next: (userInfo: any) => {
                        this.isProfessor.set(userInfo.groups.includes('teacher'));
                    }
                });
            },
        });
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => {
                localStorage.removeItem('token');
                localStorage.removeItem('authenticated');
                localStorage.removeItem('user');
                this.ui_preferences_service.setUser(null);

                // remover todos os cookies
                document.cookie.split(';').forEach(function (c) {
                    document.cookie = c
                        .replace(/^ +/, '')
                        .replace(
                            /=.*/,
                            '=;expires=' + new Date().toUTCString() + ';path=/',
                        );
                });
                // AuthService.authEmitter.emit(false);
                this.router.navigate(['/accounts/login']);
            },
            error: () => {
                notify_error("Logout failed. Contact administration.");
            }
        });
    }
}
