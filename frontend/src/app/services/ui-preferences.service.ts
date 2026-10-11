
import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
export type ViewMode = 'student' | 'teacher';

interface UiPreferences {
    theme: Theme;
    sidebarCollapsed: boolean;
    viewMode: ViewMode;
    // Course ID -> IDs of collapsed sections.
    collapsedSections: Record<string, string[]>;
}

const DEFAULT_PREFERENCES: UiPreferences = {
    theme: 'light',
    sidebarCollapsed: false,
    viewMode: 'student',
    collapsedSections: {},
};

@Injectable({ providedIn: 'root' })
export class UiPreferencesService {
    private readonly document = inject(DOCUMENT);
    private userId: string | null = null;

    private readonly _preferences = signal<UiPreferences>({
        ...DEFAULT_PREFERENCES,
        collapsedSections: {},
    });

    readonly preferences = this._preferences.asReadonly();

    readonly theme = () => this._preferences().theme;
    readonly sidebarCollapsed = () =>
        this._preferences().sidebarCollapsed;
    readonly viewMode = () => this._preferences().viewMode;

    /**
     * Call after login, or when the active user changes.
     * Pass null on logout.
     */
    setUser(userId: string | number | null): void {
        this.userId = userId === null ? null : String(userId);

        if (this.userId === null) {
            this._preferences.set({
                ...DEFAULT_PREFERENCES,
                collapsedSections: {},
            });
            return;
        }

        this.load();
    }

    private get storageKey(): string | null {
        return this.userId === null
            ? null
            : `myapp.ui-preferences.v1:${encodeURIComponent(this.userId)}`;
    }

    private load(): void {
        let preferences = { ...DEFAULT_PREFERENCES };

        try {
            const saved = localStorage.getItem(this.storageKey!);

            if (saved) {
                const parsed = JSON.parse(saved);

                preferences = {
                    theme:
                        parsed.theme === 'dark' ? 'dark' : 'light',

                    sidebarCollapsed:
                        typeof parsed.sidebarCollapsed === 'boolean'
                            ? parsed.sidebarCollapsed
                            : false,

                    viewMode:
                        parsed.viewMode === 'teacher'
                            ? 'teacher'
                            : 'student',

                    collapsedSections:
                        parsed.collapsedSections &&
                            typeof parsed.collapsedSections === 'object' &&
                            !Array.isArray(parsed.collapsedSections)
                            ? parsed.collapsedSections
                            : {},
                };
            }
        } catch {
            // Storage may be unavailable or contain invalid JSON.
        }

        this._preferences.set(preferences);
        this.applyTheme(preferences.theme);
    }

    private save(): void {
        const key = this.storageKey;

        if (key === null) {
            return;
        }

        try {
            localStorage.setItem(
                key,
                JSON.stringify(this._preferences()),
            );
        } catch {
            // Storage may be disabled or full.
        }
    }

    private update(
        changes: Partial<UiPreferences>,
    ): void {
        this._preferences.update(current => ({
            ...current,
            ...changes,
        }));

        this.applyTheme(this._preferences().theme);
        this.save();
    }

    setTheme(theme: Theme): void {
        this.update({ theme });
    }

    setSidebarCollapsed(collapsed: boolean): void {
        console.log("sidebar updated: " + collapsed);
        this.update({ sidebarCollapsed: collapsed });
    }

    setViewMode(mode: ViewMode): void {
        this.update({ viewMode: mode });
    }

    isSectionCollapsed(
        courseId: string | number,
        sectionId: string | number,
    ): boolean {
        courseId = String(courseId);
        sectionId = String(sectionId);

        if (!(courseId in this._preferences().collapsedSections)) return false;
        if (!(this._preferences().collapsedSections[courseId].includes(sectionId))) return false;
        return true;
    }

    setSectionCollapsed(
        courseId: string | number,
        sectionId: string | number,
        collapsed: boolean,
    ): void {
        const course = String(courseId);
        const section = String(sectionId);

        this._preferences.update(current => {
            const sections = new Set(
                current.collapsedSections[course] ?? [],
            );

            if (collapsed) {
                sections.add(section);
            } else {
                sections.delete(section);
            }

            return {
                ...current,
                collapsedSections: {
                    ...current.collapsedSections,
                    [course]: [...sections],
                },
            };
        });

        this.save();
    }

    toggleSection(
        courseId: string | number,
        sectionId: string | number,
    ): void {
        this.setSectionCollapsed(
            courseId,
            sectionId,
            !this.isSectionCollapsed(courseId, sectionId),
        );
    }

    private applyTheme(theme: Theme): void {
        this.document.documentElement.setAttribute(
            'data-coreui-theme',
            theme,
        );
    }
}
