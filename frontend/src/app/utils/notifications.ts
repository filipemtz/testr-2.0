import Notify from 'simple-notify'
import 'simple-notify/dist/simple-notify.css'

export function push_notify(title: string, text: string | undefined, status: any) {
    return new Notify({
        status: status,
        title: title,
        text: text,
        effect: 'slide',
        type: 'filled'
    })
}

export function notify_success(text: string) {
    return push_notify("Success", text, 'success');
}

export function notify_error(text: string) {
    return push_notify("Error", text, 'error');
}

export function notify_warn(text: string) {
    return push_notify("Warning", text, 'warn');
}