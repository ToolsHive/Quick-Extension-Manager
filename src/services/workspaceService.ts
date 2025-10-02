import { workspace } from 'vscode';
import * as path from 'path';
import { EXTENSION_CONSTANTS } from '../constants';

/**
 * Service for managing workspace operations
 */
export class WorkspaceService {

  /**
   * Gets the current workspace path
   * @throws Error if no workspace is found
   */
  getWorkspacePath(): string {
    if (!workspace.workspaceFolders?.length) {
      throw new Error(EXTENSION_CONSTANTS.MESSAGES.NO_WORKSPACE_FOUND);
    }

    const workspacePath = workspace.workspaceFolders[0].uri.fsPath;
    return path.normalize(workspacePath);
  }

  /**
   * Checks if a workspace is currently open
   */
  hasWorkspace(): boolean {
    return workspace.workspaceFolders !== undefined && workspace.workspaceFolders.length > 0;
  }

  /**
   * Gets workspace information
   */
  getWorkspaceInfo() {
    const folders = workspace.workspaceFolders;
    return {
      hasWorkspace: this.hasWorkspace(),
      folderCount: folders?.length || 0,
      rootPath: folders?.[0]?.uri.fsPath
    };
  }
}
