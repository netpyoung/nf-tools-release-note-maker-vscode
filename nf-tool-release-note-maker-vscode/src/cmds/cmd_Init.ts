import * as vscode from 'vscode';
import * as utils from '../utils';

export async function Command_Init() {
    vscode.window.showErrorMessage("HelloWorld");

    const rootFolder = utils.getOpenedRootFolder();
    if (!rootFolder) {
        vscode.window.showErrorMessage('Fail: Fail to find root folder');
        return;
    }

    const cmd = 'dotnet release-note init';
    const result = await utils.runCommand(cmd, rootFolder);
    if (!result.success) {
        vscode.window.showErrorMessage(result.stdout);
        return;
    }
    
    await vscode.commands.executeCommand('setContext', 'nf-tool-release-note-maker-vscode.package.isConfigFileExist',true);
    vscode.window.showInformationMessage('Done: dotnet release-note init');
}