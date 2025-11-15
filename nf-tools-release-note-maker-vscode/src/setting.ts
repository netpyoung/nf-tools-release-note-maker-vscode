import * as settings from './utils/settings';

export const setting = settings.createSettings('nf-tools-release-note-maker-vscode.ReleaseNoteMaker', {
    isEnableFeature: true,
    commandToPreview: 'dotnet release-note preview',
    configFileName: 'ReleaseNote.config.toml',
});