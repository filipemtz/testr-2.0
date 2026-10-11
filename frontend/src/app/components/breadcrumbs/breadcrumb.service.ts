
import { Injectable, signal } from '@angular/core';

export class BreadCrumbItem {
    name: string = '';
    url: string = '';

    constructor(name: string, url: string) {
        this.name = name;
        this.url = url;
    }
}


@Injectable({ providedIn: 'root' })
export class BreadcrumbsService {
    readonly MAX_SIZE: number = 5;

    private readonly _breadcrumbs = signal({
        "Home": new BreadCrumbItem("My Courses", "/"),
        "Course": new BreadCrumbItem("", ""),
        "Question": new BreadCrumbItem("", ""),
        "QuestionEdit": new BreadCrumbItem("", ""),
    });

    readonly breadcrumbs = this._breadcrumbs.asReadonly();

    reset() {
        this._breadcrumbs.update(breadcrumbs => ({
            ...breadcrumbs,
            "Question": new BreadCrumbItem("", ""),
            "QuestionEdit": new BreadCrumbItem("", ""),
        }));
    }

    set_course(name: string, url: string) {
        this._breadcrumbs.update(breadcrumbs => ({
            ...breadcrumbs,
            Course: new BreadCrumbItem(name, url),
        }));
    }

    set_question(name: string, url: string) {
        this._breadcrumbs.update(breadcrumbs => ({
            ...breadcrumbs,
            Question: new BreadCrumbItem(name, url),
            QuestionEdit: new BreadCrumbItem("Edit Question", url + "/edit"),
        }));
    }

    get_breadcrumbs() {
        return this.breadcrumbs;
    }
}