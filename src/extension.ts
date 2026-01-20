import * as vscode from 'vscode';

let enabled = false;
let statusBar: vscode.StatusBarItem;

/**
 * Called when the extension is activated
 */
export function activate(context: vscode.ExtensionContext) {
    // Create status bar
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = `$(eye-closed) React Dev Off`;
    statusBar.command = 'rdfs.toggleDevFolders';
    statusBar.show();

    // Register toggle command
    const disposable = vscode.commands.registerCommand('rdfs.toggleDevFolders', async () => {
        const config = vscode.workspace.getConfiguration();

        if (!enabled) {
            await config.update('files.exclude', getHiddenFiles(), vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage("React Dev Mode Enabled ✓");
            statusBar.text = `$(eye) React Dev On`;
        } else {
            await config.update('files.exclude', {}, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage("React Dev Mode Disabled ✗");
            statusBar.text = `$(eye-closed) React Dev Off`;
        }

        enabled = !enabled;
    });

    context.subscriptions.push(disposable, statusBar);
}

/**
 * Get hidden files list (defaults + user config)
 */
function getHiddenFiles() {
    const config = vscode.workspace.getConfiguration();
    const hidden = config.get<any>('rdfs.hiddenItems') || {};

    return {
        ...hidden,
        "**/public": false,
        "**/src": false
    };
}

export function deactivate() {}
