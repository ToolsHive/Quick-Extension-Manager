import { ExtensionContext } from 'vscode';
import { ExtensionManager } from './managers';
import { EXTENSION_CONSTANTS } from './constants';

/**
 * Extension activation function
 * This is called when the extension is activated
 */
export function activate(context: ExtensionContext) {
  console.log(EXTENSION_CONSTANTS.MESSAGES.EXTENSION_ACTIVE);

  const extensionManager = new ExtensionManager();
  extensionManager.initialize(context);
}

/**
 * Extension deactivation function
 * This is called when the extension is deactivated
 */
export function deactivate() {
  // Cleanup if needed
}
