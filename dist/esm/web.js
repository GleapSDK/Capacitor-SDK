import { WebPlugin } from '@capacitor/core';
export class GleapWeb extends WebPlugin {
    // All web functionality has been disabled - needs to be developed
    async initialize(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async identify(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async clearIdentity() {
        throw this.unimplemented('Not implemented on web.');
    }
    async addCustomData(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async setCustomData(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async removeCustomData(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async clearCustomData() {
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
    startFeedbackFlow(_options) {
        throw new Error('Method not implemented.');
    }
    async setLanguage(_options) {
        throw this.unimplemented('Not implemented on web.');
    }
    async log(_options) {
        throw new Error('Method not implemented.');
    }
    async setEventCallback(_callback) {
        throw new Error('Method not implemented.');
    }
    async sendSilentCrashReport(_options) {
        throw new Error('Method not implemented.');
    }
    async open() {
        throw new Error('Method not implemented.');
    }
    async close() {
        throw new Error('Method not implemented.');
    }
    async isOpened() {
        throw new Error('Method not implemented.');
    }
    async disableConsoleLogOverwrite() {
        throw new Error('Method not implemented.');
    }
    async enableDebugConsoleLog() {
        throw new Error('Method not implemented.');
    }
    async preFillForm(_options) {
        throw new Error('Method not implemented.');
    }
    async addAttachment(_options) {
        throw new Error('Method not implemented.');
    }
    async removeAllAttachments() {
        throw new Error('Method not implemented.');
    }
    async attachCustomData(_options) {
        throw new Error('Method not implemented.');
    }
}
//# sourceMappingURL=web.js.map