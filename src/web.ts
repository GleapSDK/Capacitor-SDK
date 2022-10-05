import { WebPlugin } from '@capacitor/core';
import Gleap from 'gleap';

import type { GleapEventCallback, GleapPlugin } from './definitions';

export class GleapWeb extends WebPlugin implements GleapPlugin {
  static callbacks: { [key: string]: GleapEventCallback } = {};
  static initialized = false;

  async initialize(options: { API_KEY: string }): Promise<{ initialized: boolean; }> {
    if (GleapWeb.initialized) {
      return { initialized: true };
    }

    Gleap.initialize(options.API_KEY);

    GleapWeb.initialized = true;
    this.registerCallbackListeners();

    return { initialized: true };
  }

  registerCallbackListeners(): void {
    Gleap.on("open", () => {
      this.notifyCallbacks("open", {});
    });

    Gleap.on("close", () => {
      this.notifyCallbacks("close", {});
    });

    Gleap.on("feedback-sent", (formData) => {
      this.notifyCallbacks("feedback-sent", formData);
    });

    Gleap.on("flow-started", (flow) => {
      this.notifyCallbacks("flow-started", flow);
    });

    Gleap.on("error-while-sending", () => {
      this.notifyCallbacks("error-while-sending", {});
    });

    Gleap.registerCustomAction((customAction) => {
      this.notifyCallbacks("custom-action-called", customAction);
    });
  }

  notifyCallbacks(event: string, data: any): void {
    if (!GleapWeb.callbacks) {
      return;
    }

    for (var callbackId in GleapWeb.callbacks) {
      GleapWeb.callbacks[callbackId](event, data);
    }
  }

  async showFeedbackButton(options: { show: boolean; }): Promise<{ feedbackButtonShown: boolean; }> {
    Gleap.showFeedbackButton(options.show ? true : false);

    return { feedbackButtonShown: true };
  }

  async identify(options: { userId: string; userHash?: string | undefined; name?: string | undefined; email?: string | undefined; phone?: string | undefined; value?: number | undefined; }): Promise<{ identify: boolean; }> {
    var userData = {
      name: options.name,
      email: options.email,
      phone: options.phone,
      value: options.value,
    };
    if (options.userHash) {
      Gleap.identify(options.userId, userData, options.userHash);
    } else {
      Gleap.identify(options.userId, userData);
    }

    return { identify: true };
  }

  async clearIdentity(): Promise<{ clearIdentity: boolean; }> {
    Gleap.clearIdentity();

    return { clearIdentity: true };
  }

  async attachCustomData(options: { data: any; }): Promise<{ attachedCustomData: boolean; }> {
    Gleap.attachCustomData(options.data);

    return { attachedCustomData: true };
  }

  async setCustomData(options: { key: string, value: string }): Promise<{ setCustomData: boolean; }> {
    Gleap.setCustomData(options.key, options.value);

    return { setCustomData: true };
  }

  async removeCustomData(options: { key: string; }): Promise<{ removedCustomData: boolean; }> {
    Gleap.removeCustomData(options.key);

    return { removedCustomData: true };
  }

  async clearCustomData(): Promise<{ clearedCustomData: boolean; }> {
    Gleap.clearCustomData();

    return { clearedCustomData: true };
  }

  async trackEvent(options: { name: string; data?: any; }): Promise<{ loggedEvent: boolean; }> {
    Gleap.trackEvent(options.name, options.data);

    return { loggedEvent: true };
  }

  async startFeedbackFlow(options: { feedbackFlow?: string | undefined; showBackButton?: boolean | undefined; }): Promise<{ startedFeedbackFlow: boolean; }> {
    if (!options.feedbackFlow) {

    }

    Gleap.startFeedbackFlow(options.feedbackFlow ?? "bugreporting", options.showBackButton);

    return { startedFeedbackFlow: true };
  }

  async setLanguage(options: { languageCode: string }): Promise<{ setLanguage: string; }> {
    Gleap.setLanguage(options.languageCode);

    return { setLanguage: options.languageCode };
  }

  async log(options: { message: string; logLevel?: 'ERROR' | 'WARNING' | 'INFO' | undefined; }): Promise<{ logged: boolean; }> {
    Gleap.log(options.message, options.logLevel);

    return { logged: true };
  }

  async setEventCallback(callback: GleapEventCallback): Promise<string> {
    var callbackId = this.makeid(10);
    GleapWeb.callbacks[callbackId] = callback;
    return callbackId;
  }

  async sendSilentCrashReport(options: { description: string; severity?: 'LOW' | 'MEDIUM' | 'HIGH' | undefined; dataExclusion?: { customData: Boolean; metaData: Boolean; attachments: Boolean; consoleLog: Boolean; networkLogs: Boolean; customEventLog: Boolean; screenshot: Boolean; replays: Boolean; } | undefined; }): Promise<{ sentSilentBugReport: boolean; }> {
    Gleap.sendSilentCrashReport(options.description, options.severity, options.dataExclusion);

    return { sentSilentBugReport: true };
  }

  async open(): Promise<{ openedWidget: boolean; }> {
    Gleap.open();

    return { openedWidget: true };
  }

  async openNews(): Promise<{ openedNews: boolean; }> {
    Gleap.openNews();
    
    return { openedNews: true };
  }

  async close(): Promise<{ closedWidget: boolean; }> {
    Gleap.close();

    return { closedWidget: true };
  }

  async isOpened(): Promise<{ isOpened: boolean; }> {
    return { isOpened: Gleap.isOpened() };
  }

  async disableConsoleLogOverwrite(): Promise<{ consoleLogDisabled: boolean; }> {
    Gleap.disableConsoleLogOverwrite();

    return { consoleLogDisabled: true };
  }

  async enableDebugConsoleLog(): Promise<{ debugConsoleLogEnabled: boolean; }> {
    return { debugConsoleLogEnabled: true };
  }

  async preFillForm(options: { data: any; }): Promise<{ preFilledForm: boolean; }> {
    Gleap.preFillForm(options.data);

    return { preFilledForm: true };
  }

  async addAttachment(_options: { base64data: string; name: string; }): Promise<{ attachmentAdded: boolean; }> {
    throw this.unavailable('addAttachment not available for browsers');
  }

  async removeAllAttachments(): Promise<{ allAttachmentsRemoved: boolean; }> {
    throw this.unavailable('removeAllAttachments not available for browsers');
  }

  private makeid(length: number): string {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}
