import { WebPlugin } from '@capacitor/core';

import type { GleapPlugin } from './definitions';

export class GleapWeb extends WebPlugin implements GleapPlugin {

  // All web functionality has been disabled - needs to be developed

  async initialize(_options: { API_KEY: string }): Promise<{ initialized: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async setUserIdentity(_options: { userId: string, userName?: string, userEmail?: string }): Promise<{ setUserIdentity: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async clearUserIdentity(): Promise<{ clearIdentity: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async addCustomData(_options: { dataKey: string, dataValue: string }): Promise<{ addCustomData: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async appendCustomData(_options: { dataKey: string, dataValue: string }): Promise<{ appendCustomData: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async removeCustomData(_options: { dataKey: string }): Promise<{ removeCustomData: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async clearCustomData(_options: { dataKey: string }): Promise<{ clearCustomData: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async logEvent(_options: { logEventSubject: string, logEventData?: string }): Promise<{ logEvent: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async sendSilentBugReport(_options: { silentBugReportInfo: string, silentBugReportSeverity: string }): Promise<{ sendSilentBugReport: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async openWidget(): Promise<{ openWidget: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async startFeedbackFlow(_options: { feedbackType?: string }): Promise<{ startFeedbackFlow: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async setLanguage(_options: { languageCode: string }): Promise<{ setLanguage: string; }> {
    throw this.unimplemented('Not implemented on web.');
  }

}
