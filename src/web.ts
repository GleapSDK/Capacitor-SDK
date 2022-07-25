import { WebPlugin } from '@capacitor/core';

import type { GleapEventCallback, GleapPlugin } from './definitions';

export class GleapWeb extends WebPlugin implements GleapPlugin {
  // All web functionality has been disabled - needs to be developed

  async initialize(_options: { API_KEY: string }): Promise<{ initialized: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async identify(_options: { userId: string, userName?: string, userEmail?: string }): Promise<{ identify: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async clearIdentity(): Promise<{ clearIdentity: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async addCustomData(_options: { key: string; value: string; }): Promise<{ addedCustomData: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async setCustomData(_options: { key: string, value: string }): Promise<{ setCustomData: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async removeCustomData(_options: { key: string; }): Promise<{ removedCustomData: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async clearCustomData(): Promise<{ clearedCustomData: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async logEvent(_options: { name: string; data?: any; }): Promise<{ loggedEvent: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async sendSilentBugReport(_options: { silentBugReportInfo: string, silentBugReportSeverity: string }): Promise<{ sendSilentBugReport: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async openWidget(): Promise<{ openWidget: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async startFeedbackFlow(_options: { feedbackFlow?: string | undefined; showBackButton?: boolean | undefined; }): Promise<{ startFeedbackFlow: boolean; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async setLanguage(_options: { languageCode: string }): Promise<{ setLanguage: string; }> {
    throw this.unimplemented('Not implemented on web.');
  }

  async log(_options: { message: string; logLevel?: 'ERROR' | 'WARNING' | 'INFO' | undefined; }): Promise<{ logged: boolean; }> {
    throw new Error('Method not implemented.');
  }
  
  async setEventCallback(_callback: GleapEventCallback): Promise<string> {
    throw new Error('Method not implemented.');
  }
  
  async sendSilentCrashReport(_options: { description: string; severity?: 'LOW' | 'MEDIUM' | 'HIGH' | undefined; dataExclusion?: { customData?: Boolean | undefined; metaData?: Boolean | undefined; attachments?: Boolean | undefined; consoleLog?: Boolean | undefined; networkLogs?: Boolean | undefined; customEventLog?: Boolean | undefined; screenshot?: Boolean | undefined; replays?: Boolean | undefined; } | undefined; }): Promise<{ sentSilentBugReport: boolean; }> {
    throw new Error('Method not implemented.');
  }
  
  async open(): Promise<{ openedWidget: boolean; }> {
    throw new Error('Method not implemented.');
  }
  
  async close(): Promise<{ closedWidget: boolean; }> {
    throw new Error('Method not implemented.');
  }
  
  async isOpened(): Promise<{ isOpened: boolean; }> {
    throw new Error('Method not implemented.');
  }
  
  async disableConsoleLogOverwrite(): Promise<{ consoleLogDisabled: boolean; }> {
    throw new Error('Method not implemented.');
  }
  
  async enableDebugConsoleLog(): Promise<{ debugConsoleLogEnabled: boolean; }> {
    throw new Error('Method not implemented.');
  }

  async preFillForm(_options: { data: any; }): Promise<{ preFilledForm: boolean; }> {
    throw new Error('Method not implemented.');
  }

  async addAttachment(_options: { base64data: string; name: string; }): Promise<{ attachmentAdded: boolean; }> {
    throw new Error('Method not implemented.');
  }

  async removeAllAttachments(): Promise<{ allAttachmentsRemoved: boolean; }> {
    throw new Error('Method not implemented.');
  }
}
