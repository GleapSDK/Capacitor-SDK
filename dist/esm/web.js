import { WebPlugin } from '@capacitor/core';
export class GleapWeb extends WebPlugin {
    // All web functionality has been disabled - needs to be developed
    async initialize(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async setUserIdentity(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async clearUserIdentity() {
        throw this.unimplemented('Not implemented on web.');
    }
    async addCustomData(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async appendCustomData(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async removeCustomData(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async clearCustomData(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async logEvent(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async sendSilentBugReport(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async openWidget() {
        throw this.unimplemented('Not implemented on web.');
    }
    async startFeedbackFlow(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async setLanguage(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
}
//# sourceMappingURL=web.js.map