import { ValidatedConfig } from '../types';
import { EXTENSION_CONSTANTS } from '../constants';

/**
 * Service for building VS Code CLI commands
 */
export class CommandBuilderService {

  /**
   * Builds the complete CLI command for disabling extensions
   */
  buildDisableCommand(config: ValidatedConfig, workspacePath: string): string {
    let command = this.getBaseCommand(config.openInNewWindow);

    // Disable self to prevent recursion
    command += ` --disable-extension ${EXTENSION_CONSTANTS.EXTENSION_ID}`;

    // Disable all configured extensions
    config.disabled.forEach(extensionId => {
      command += ` --disable-extension ${extensionId}`;
    });

    // Add workspace path
    command += ` "${workspacePath}"`;

    return command;
  }

  /**
   * Gets the base VS Code command based on window preference
   */
  private getBaseCommand(openInNewWindow: boolean): string {
    return openInNewWindow
      ? EXTENSION_CONSTANTS.CLI_COMMANDS.CODE_NEW_WINDOW
      : EXTENSION_CONSTANTS.CLI_COMMANDS.CODE_REUSE_WINDOW;
  }

  /**
   * Builds command to check VS Code CLI availability
   */
  getVersionCheckCommand(): string {
    return EXTENSION_CONSTANTS.CLI_COMMANDS.CODE_VERSION;
  }
}
