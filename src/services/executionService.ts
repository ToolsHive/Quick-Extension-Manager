import { commands, Uri } from 'vscode';
import { exec, execSync } from 'child_process';
import { ValidatedConfig } from '../types';
import { EXTENSION_CONSTANTS } from '../constants';

/**
 * Service for executing commands and managing VS Code windows
 */
export class ExecutionService {

  /**
   * Checks if VS Code CLI is available
   */
  async checkVSCodeCLI(workspacePath: string): Promise<boolean> {
    try {
      execSync(EXTENSION_CONSTANTS.CLI_COMMANDS.CODE_VERSION, { cwd: workspacePath });
      return true;
    } catch (error) {
      console.error('VS Code CLI check failed:', error);
      return false;
    }
  }

  /**
   * Executes the disable extensions command
   */
  executeDisableCommand(command: string, workspacePath: string, config: ValidatedConfig): void {
    const executeCommand = () => {
      exec(command, { cwd: workspacePath }, (error) => {
        if (error) {
          console.error(`Execution error: ${error}`);
          // Error will be handled by the calling service
        }
      });
    };

    if (config.openInNewWindow === false) {
      // Close current folder and then execute
      commands.executeCommand(EXTENSION_CONSTANTS.VSCODE_COMMANDS.CLOSE_FOLDER)
        .then(() => {
          setTimeout(executeCommand, EXTENSION_CONSTANTS.TIMEOUTS.CLOSE_FOLDER_DELAY);
        });
    } else {
      // Close current window and execute
      commands.executeCommand(EXTENSION_CONSTANTS.VSCODE_COMMANDS.CLOSE_WINDOW);
      executeCommand();
    }
  }

  /**
   * Opens a URL in VS Code
   */
  async openUrl(url: string): Promise<void> {
    await commands.executeCommand(EXTENSION_CONSTANTS.VSCODE_COMMANDS.OPEN_URL, Uri.parse(url));
  }
}
