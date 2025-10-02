import { commands, ExtensionContext } from 'vscode';
import { EXTENSION_CONSTANTS } from '../constants';
import { UserInteractionService } from './userInteractionService';
import { ExecutionService } from './executionService';
import { ConfigurationService } from './configurationService';
import { WorkspaceService } from './workspaceService';
import { ExtensionManagerWebviewService } from './extensionManagerWebviewService';




/**
 * Service for handling extension commands
 */
export class CommandService {
  private userInteraction: UserInteractionService;
  private executionService: ExecutionService;
  private configService: ConfigurationService;
  private workspaceService: WorkspaceService;
  private webviewService: ExtensionManagerWebviewService;
  private isExtensionEnabled: boolean = true;

  constructor() {
    this.userInteraction = new UserInteractionService();
    this.executionService = new ExecutionService();
    this.configService = new ConfigurationService();
    this.workspaceService = new WorkspaceService();
    this.webviewService = new ExtensionManagerWebviewService();
  }

  /**
   * Registers all extension commands
   */
  registerCommands(context: ExtensionContext): void {
    // Initialize webview service with context
    this.webviewService.initialize(context);
    const commandList = [
      {
        command: EXTENSION_CONSTANTS.COMMANDS.ENABLE,
        handler: () => this.enableExtension()
      },
      {
        command: EXTENSION_CONSTANTS.COMMANDS.DISABLE,
        handler: () => this.disableExtension()
      },
      {
        command: EXTENSION_CONSTANTS.COMMANDS.UPDATE,
        handler: () => this.checkForUpdates()
      },
      {
        command: EXTENSION_CONSTANTS.COMMANDS.GITHUB,
        handler: () => this.openGitHub()
      },
      {
        command: EXTENSION_CONSTANTS.COMMANDS.SETTINGS,
        handler: () => this.openSettings()
      },
      {
        command: EXTENSION_CONSTANTS.COMMANDS.REPORT,
        handler: () => this.reportIssue()
      },
      {
        command: EXTENSION_CONSTANTS.COMMANDS.MANAGE,
        handler: () => this.manageExtensions()
      }
    ];

    commandList.forEach(({ command, handler }) => {
      const disposable = commands.registerCommand(command, handler);
      context.subscriptions.push(disposable);
    });
  }

  /**
   * Enable the extension functionality
   */
  private async enableExtension(): Promise<void> {
    if (this.isExtensionEnabled) {
      this.userInteraction.showInfo(EXTENSION_CONSTANTS.MESSAGES.EXTENSION_ALREADY_ENABLED);
      return;
    }

    this.isExtensionEnabled = true;
    this.userInteraction.showInfo(EXTENSION_CONSTANTS.MESSAGES.EXTENSION_ENABLED);
  }

  /**
   * Disable the extension functionality
   */
  private async disableExtension(): Promise<void> {
    if (!this.isExtensionEnabled) {
      this.userInteraction.showInfo(EXTENSION_CONSTANTS.MESSAGES.EXTENSION_ALREADY_DISABLED);
      return;
    }

    const confirmed = await this.userInteraction.showConfirmation({
      message: 'Are you sure you want to disable Quick Extension Manager?',
      detail: 'You can re-enable it later from the command palette.'
    });

    if (confirmed.confirmed) {
      this.isExtensionEnabled = false;
      this.userInteraction.showInfo(EXTENSION_CONSTANTS.MESSAGES.EXTENSION_DISABLED);
    }
  }

  /**
   * Check for extension updates
   */
  private async checkForUpdates(): Promise<void> {
    this.userInteraction.showInfo(EXTENSION_CONSTANTS.MESSAGES.UPDATE_CHECK);

    try {
      // In a real scenario, you would check against a version API
      // For now, we'll direct users to the marketplace
      const shouldOpenMarketplace = await this.userInteraction.showConfirmation({
        message: EXTENSION_CONSTANTS.MESSAGES.UPDATE_NOT_AVAILABLE,
        detail: 'Would you like to check the marketplace for the latest version?'
      });

      if (shouldOpenMarketplace.confirmed) {
        await this.executionService.openUrl(EXTENSION_CONSTANTS.URLS.MARKETPLACE);
      }
    } catch (error) {
      console.error('Update check failed:', error);
      this.userInteraction.showError('Failed to check for updates');
    }
  }

  /**
   * Open GitHub repository
   */
  private async openGitHub(): Promise<void> {
    this.userInteraction.showInfo(EXTENSION_CONSTANTS.MESSAGES.OPENING_GITHUB);
    await this.executionService.openUrl(EXTENSION_CONSTANTS.URLS.GITHUB_REPO);
  }

  /**
   * Open extension settings
   */
  private async openSettings(): Promise<void> {
    this.userInteraction.showInfo(EXTENSION_CONSTANTS.MESSAGES.OPENING_SETTINGS);

    // Open VS Code settings filtered to this extension
    await commands.executeCommand('workbench.action.openSettings', '@ext:ToolsHive.vscode-quick-extension-manager');
  }

  /**
   * Report an issue
   */
  private async reportIssue(): Promise<void> {
    this.userInteraction.showInfo(EXTENSION_CONSTANTS.MESSAGES.OPENING_REPORT);
    await this.executionService.openUrl(EXTENSION_CONSTANTS.URLS.GITHUB_ISSUES);
  }

  /**
   * Manage extensions - show the webview interface for managing extensions
   */
  private async manageExtensions(): Promise<void> {
    try {
      await this.webviewService.showExtensionManager();
    } catch (error) {
      console.error('Extension management failed:', error);
      this.userInteraction.showError('Failed to open extension manager');
    }
  }



  /**
   * Check if the extension is currently enabled
   */
  isEnabled(): boolean {
    return this.isExtensionEnabled;
  }

  /**
   * Set the extension enabled state
   */
  setEnabled(enabled: boolean): void {
    this.isExtensionEnabled = enabled;
  }
}
