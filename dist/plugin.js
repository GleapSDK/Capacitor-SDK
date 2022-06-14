var capacitorGleap = (function (exports, core) {
    'use strict';

    const Gleap = core.registerPlugin('Gleap', {
        web: () => Promise.resolve().then(function () { return web; }).then(m => new m.GleapWeb()),
    });

    class GleapWeb extends core.WebPlugin {
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

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        GleapWeb: GleapWeb
    });

    exports.Gleap = Gleap;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
