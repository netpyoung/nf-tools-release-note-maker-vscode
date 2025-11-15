import * as settings from './utils/settings';

export const setting = settings.createSettings('nf-tools-release-note-maker-vscode', {
    isEnableFeature: true,
    commandToPreview: 'dotnet release-note preview --name PREVIEW_NAME --version PREVIEW_VERSION',
    configFileName: 'ReleaseNote.config.toml',
});