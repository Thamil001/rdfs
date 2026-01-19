import * as vscode from 'vscode';

let enabled = false;
let statusBar: vscode.StatusBarItem;

/**
 * Detect if current workspace is a React project by reading package.json
 */
async function isReactProject(): Promise<boolean> {
    const workspace = vscode.workspace.workspaceFolders?.[0];
    if (!workspace) {return false;}

    const pkgUri = vscode.Uri.joinPath(workspace.uri, 'package.json');

    try {
        const data = await vscode.workspace.fs.readFile(pkgUri);
        const json = JSON.parse(Buffer.from(data).toString());
        return !!(json.dependencies?.react || json.devDependencies?.react);
    } catch {
        return false;
    }
}

/**
 * Called when extension is activated
 */
export async function activate(context: vscode.ExtensionContext) {

    // Check if React project exists
    if (!(await isReactProject())) {
        vscode.window.showWarningMessage("Not a React project — React Dev Toggle disabled");
        return;
    }

    // Create status bar item
    statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBar.text = `$(eye-closed) React Dev Off`;
    statusBar.command = 'rdfs.toggleDevFolders';
    statusBar.show();

    // Register command
    const disposable = vscode.commands.registerCommand('rdfs.toggleDevFolders', async () => {
        const config = vscode.workspace.getConfiguration();

        if (!enabled) {
            // Enable hidden files mode
            await config.update('files.exclude', getHiddenFiles(), vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage("React Dev Mode Enabled");
            statusBar.text = `$(eye) React Dev On`;
        } else {
            // Disable hidden files mode
            await config.update('files.exclude', {}, vscode.ConfigurationTarget.Workspace);
            vscode.window.showInformationMessage("React Dev Mode Disabled");
            statusBar.text = `$(eye-closed) React Dev Off`;
        }

        enabled = !enabled;
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(statusBar);
}

/**
 * Use user config (rdfs.hiddenItems) + defaults
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
