// Redirect to a different URL
export function redirectTo(url) {
    window.location.href = url;
}
export function getCurrentUrl() {
    return window.location.href;
}
