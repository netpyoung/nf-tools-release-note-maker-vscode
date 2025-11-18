import * as vscode from 'vscode';

export * from './runner';
export * from './settings';

export function getOpenedRootFolder(): string | undefined {
	return vscode.workspace.workspaceFolders?.[0].uri.fsPath;
}