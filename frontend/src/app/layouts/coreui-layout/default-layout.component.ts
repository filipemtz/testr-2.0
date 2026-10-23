import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
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
} from '@coreui/angular';

import { DefaultFooterComponent, DefaultHeaderComponent } from '.';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';
import { UiPreferencesService } from '../../services/ui-preferences.service';
import { SideBarService } from './sidebar.service';
import { notify_error } from '../../utils/notifications';
import { CourseService } from '../../services/course.service';

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
export class DefaultLayoutComponent implements OnInit {
    protected readonly sidebar_service = inject(SideBarService);
    protected readonly ui_preferences_service = inject(UiPreferencesService);
    public courses = this.sidebar_service.courses;
    readonly icons = { ...freeSet };

    constructor(
        private courseService: CourseService,
    ) { }

    ngOnInit(): void {
        this._init_sidebar_courses();
    }

    private _init_sidebar_courses() {
        this.courseService.getCourses().subscribe({
            next: (response) => {
                this.sidebar_service.setCourses(response.results);
            },
            error: (err) => {
                console.log(err);
                notify_error("Erro ao carregar os cursos");
            },
        });
    }
}
