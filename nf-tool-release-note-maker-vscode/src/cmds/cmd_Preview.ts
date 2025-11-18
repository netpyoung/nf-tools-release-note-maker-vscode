import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as utils from '../utils';
import * as setting from '../setting';

export async function Command_Preview() {
	const rootFolder = utils.getOpenedRootFolder();
	if (!rootFolder) {
		return;
	}

	const cmd = `${setting.setting.commandToPreview} --config ${setting.setting.configFileName}`;
	vscode.window.showInformationMessage(`cmd: ${cmd}`);

	const result = await utils.runCommand(cmd, rootFolder);
	if (!result.success) {
		vscode.window.showErrorMessage(result.stdout);
		return;
	}

	const markdown = result.stdout;
	const tmpFile = path.join(os.tmpdir(), `preview-${Date.now()}.md`);
	fs.writeFileSync(tmpFile, markdown, 'utf-8');
	const tmpUri = vscode.Uri.file(tmpFile);

	const doc = await vscode.workspace.openTextDocument(tmpUri);
	await vscode.window.showTextDocument(doc, { preview: true, preserveFocus: false });
	await vscode.commands.executeCommand('markdown.showPreviewToSide', tmpUri);
}