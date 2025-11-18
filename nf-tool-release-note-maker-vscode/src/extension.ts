import * as vscode from 'vscode';
import * as cmds from './cmds';
import * as utils from './utils';
import * as setting from './setting';
import * as fs from 'fs';
import * as path from 'path';

export async function activate(context: vscode.ExtensionContext) {
	const cmdPreview = vscode.commands.registerCommand('nf-tool-release-note-maker-vscode.package.cmdPreview', cmds.Command_Preview);
	context.subscriptions.push(cmdPreview);

	const cmdCreate = vscode.commands.registerCommand('nf-tool-release-note-maker-vscode.package.cmdCreate', cmds.Command_Create);
	context.subscriptions.push(cmdCreate);

	const cmdBuild = vscode.commands.registerCommand('nf-tool-release-note-maker-vscode.package.cmdBuild', cmds.Command_Build);
	context.subscriptions.push(cmdBuild);

	await updateContext();
}

export function isConfigFileExist(): boolean {
	const rootFolder = utils.getOpenedRootFolder();
	if (!rootFolder) {
		return false;
	}

	const configPath = path.join(rootFolder, setting.setting.configFileName);
	return fs.existsSync(configPath);
}

async function updateContext() {
	await vscode.commands.executeCommand('setContext', 'nf-tool-release-note-maker-vscode.package.isConfigFileExist', isConfigFileExist());
}