import { window, MessageItem } from 'vscode';
import { ConfirmationOptions, ConfirmationResult } from '../types';

/**
 * Service for handling user interactions and dialogs
 */
export class UserInteractionService {

  /**
   * Shows a confirmation dialog to the user
   */
  async showConfirmation(options: ConfirmationOptions): Promise<ConfirmationResult> {
    interface ConfirmItem extends MessageItem {
      value: 'confirm' | 'cancel'
    }

    const result = await window.showInformationMessage<ConfirmItem>(
      options.message,
      {
        modal: options.modal ?? true,
        detail: options.detail
      },
      { title: 'Cancel', isCloseAffordance: true, value: 'cancel' },
      { title: 'Yes', value: 'confirm' }
    );

    return {
      confirmed: result?.value === 'confirm'
    };
  }

  /**
   * Shows an information message
   */
  showInfo(message: string): void {
    window.showInformationMessage(message);
  }

  /**
   * Shows an error message with optional action
   */
  async showError(message: string, actionTitle?: string): Promise<boolean> {
    if (!actionTitle) {
      window.showErrorMessage(message);
      return false;
    }

    interface ErrorItem extends MessageItem {
      value: 'action'
    }

    const result = await window.showErrorMessage<ErrorItem>(
      message,
      { title: actionTitle, value: 'action' }
    );

    return result?.value === 'action';
  }

  /**
   * Shows a warning message
   */
  showWarning(message: string): void {
    window.showWarningMessage(message);
  }
}
