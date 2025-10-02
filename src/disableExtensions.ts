import { ExtensionContext } from 'vscode';
import { ExtensionManager } from './managers';

/**
 * Legacy function for disabling extensions
 * @deprecated Use ExtensionManager directly instead
 */
export default function disableExtensions(context: ExtensionContext): void {
  const manager = new ExtensionManager();
  manager.disableExtensions(context);
}
