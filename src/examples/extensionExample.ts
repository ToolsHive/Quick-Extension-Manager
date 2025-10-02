/**
 * Example of how to extend the extension with new functionality
 * This demonstrates the extensibility of the refactored architecture
 */

import { ExtensionContext, commands } from 'vscode';
import { ExtensionManager } from '../managers';
import {
  ConfigurationService,
  UserInteractionService,
  WorkspaceService
} from '../services';

/**
 * Example: Extension Statistics Service
 * Shows how easy it is to add new features using the service architecture
 */
export class ExtensionStatsService {
  private configService: ConfigurationService;
  private userInteraction: UserInteractionService;
  private workspaceService: WorkspaceService;

  constructor() {
    this.configService = new ConfigurationService();
    this.userInteraction = new UserInteractionService();
    this.workspaceService = new WorkspaceService();
  }

  /**
   * Example method: Show statistics about disabled extensions
   */
  async showExtensionStats(): Promise<void> {
    try {
      const configResult = await this.configService.loadConfig();
      if (!configResult.success || !configResult.config) {
        this.userInteraction.showError('Unable to load configuration');
        return;
      }

      const config = configResult.config;
      const workspaceInfo = this.workspaceService.getWorkspaceInfo();

      const stats = {
        totalDisabled: config.disabled.length,
        autoReload: config.autoReload,
        openInNewWindow: config.openInNewWindow,
        workspaceName: workspaceInfo.rootPath?.split('\\').pop() || 'Unknown'
      };

      const message = `Extension Stats:
• Disabled Extensions: ${stats.totalDisabled}
• Auto Reload: ${stats.autoReload ? 'Yes' : 'No'}
• Open in New Window: ${stats.openInNewWindow ? 'Yes' : 'No'}
• Workspace: ${stats.workspaceName}`;

      this.userInteraction.showInfo(message);
    } catch (error) {
      console.error('Stats error:', error);
      this.userInteraction.showError('Failed to generate statistics');
    }
  }
}

/**
 * Example: Enhanced Extension Manager
 * Shows how to extend the existing manager with new functionality
 */
export class EnhancedExtensionManager extends ExtensionManager {
  private statsService: ExtensionStatsService;

  constructor() {
    super();
    this.statsService = new ExtensionStatsService();
  }

  /**
   * Register additional commands for the enhanced functionality
   */
  registerEnhancedCommands(context: ExtensionContext): void {
    // Register new command for showing stats
    const showStatsCommand = commands.registerCommand(
      'quickExtensionManager.showStats',
      () => this.statsService.showExtensionStats()
    );

    context.subscriptions.push(showStatsCommand);
  }
}

/**
 * Example usage in extension.ts:
 *
 * export function activate(context: ExtensionContext) {
 *   console.log(EXTENSION_CONSTANTS.MESSAGES.EXTENSION_ACTIVE);
 *
 *   // Use enhanced manager instead of basic one
 *   const enhancedManager = new EnhancedExtensionManager();
 *   enhancedManager.registerEnhancedCommands(context);
 *   enhancedManager.disableExtensions(context);
 * }
 */
