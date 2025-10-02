import { ExtensionContext } from 'vscode';
import {
  ConfigurationService,
  WorkspaceService,
  CommandBuilderService,
  UserInteractionService,
  ExecutionService
} from '../services';
import { EXTENSION_CONSTANTS } from '../constants';

/**
 * Main extension manager class that orchestrates the disable extensions functionality
 */
export class ExtensionManager {
  private configService: ConfigurationService;
  private workspaceService: WorkspaceService;
  private commandBuilder: CommandBuilderService;
  private userInteraction: UserInteractionService;
  private executionService: ExecutionService;

  constructor() {
    this.configService = new ConfigurationService();
    this.workspaceService = new WorkspaceService();
    this.commandBuilder = new CommandBuilderService();
    this.userInteraction = new UserInteractionService();
    this.executionService = new ExecutionService();
  }

  /**
   * Main method to disable extensions based on configuration
   */
  async disableExtensions(context: ExtensionContext): Promise<void> {
    try {
      // Load and validate configuration
      const configResult = await this.configService.loadConfig();
      if (!configResult.success || !configResult.config) {
        this.userInteraction.showError(configResult.error || 'Failed to load configuration');
        return;
      }

      const config = configResult.config;

      // Check if there are extensions to disable
      if (!this.configService.hasExtensionsToDisable(config)) {
        this.userInteraction.showInfo(EXTENSION_CONSTANTS.MESSAGES.NO_EXTENSIONS_TO_DISABLE);
        return;
      }

      // Get workspace path
      const workspacePath = this.workspaceService.getWorkspacePath();

      // Check VS Code CLI availability
      const cliAvailable = await this.executionService.checkVSCodeCLI(workspacePath);
      if (!cliAvailable) {
        await this.handleCLINotAvailable();
        return;
      }

      // Build the disable command
      const command = this.commandBuilder.buildDisableCommand(config, workspacePath);

      // Execute based on auto-reload setting
      if (config.autoReload === false) {
        const confirmResult = await this.userInteraction.showConfirmation({
          message: EXTENSION_CONSTANTS.MESSAGES.DISABLE_EXTENSIONS_CONFIRM,
          modal: true
        });

        if (confirmResult.confirmed) {
          this.executionService.executeDisableCommand(command, workspacePath, config);
        }
      } else {
        this.executionService.executeDisableCommand(command, workspacePath, config);
      }

    } catch (error) {
      console.error('ExtensionManager error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      this.userInteraction.showError(errorMessage);
    }
  }

  /**
   * Handles the case when VS Code CLI is not available
   */
  private async handleCLINotAvailable(): Promise<void> {
    const showDocs = await this.userInteraction.showError(
      EXTENSION_CONSTANTS.MESSAGES.CODE_COMMAND_NOT_RECOGNIZED,
      'Learn more'
    );

    if (showDocs) {
      await this.executionService.openUrl(EXTENSION_CONSTANTS.URLS.VS_CODE_CLI_DOCS);
    }
  }
}
