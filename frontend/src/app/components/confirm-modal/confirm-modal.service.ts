// confirm.service.ts
import { Injectable, signal } from '@angular/core';

export interface ConfirmOptions {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    color?: 'danger' | 'warning' | 'primary';
}

const DEFAULTS: Required<ConfirmOptions> = {
    title: 'Confirm',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    color: 'primary',
};

@Injectable({ providedIn: 'root' })
export class ConfirmModalService {
    readonly visible = signal(false);
    readonly options = signal<Required<ConfirmOptions>>(DEFAULTS);
    private resolver?: (result: boolean) => void;

    confirm(opts: ConfirmOptions): Promise<boolean> {
        this.resolver?.(false); // if one is already open, cancel it
        this.options.set({ ...DEFAULTS, ...opts });
        this.visible.set(true);
        return new Promise<boolean>(resolve => (this.resolver = resolve));
    }

    /** Shortcut for the most common case */
    delete(itemName?: string): Promise<boolean> {
        return this.confirm({
            title: 'Confirm deletion',
            message: itemName
                ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
                : 'Are you sure you want to delete this item? This action cannot be undone.',
            confirmText: 'Delete',
            color: 'danger',
        });
    }

    close(result: boolean) {
        this.visible.set(false);
        this.resolver?.(result);
        this.resolver = undefined;
    }
}