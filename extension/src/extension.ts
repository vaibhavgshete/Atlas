import * as vscode from 'vscode';
import { scanWorkspace } from './scanner';
import { extractDependencies } from './dependencies';
import { replaceMemory } from './storage';
import { AtlasMemoryProvider } from './treeView';

export function activate(context: vscode.ExtensionContext): void {
    const output = vscode.window.createOutputChannel('Atlas');

    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const treeProvider = new AtlasMemoryProvider(workspaceRoot);
    const treeView = vscode.window.registerTreeDataProvider('atlas.memoryView', treeProvider);

    const enableCommand = vscode.commands.registerCommand('atlas.enable', async () => {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            vscode.window.showErrorMessage('Atlas: open a folder to scan.');
            return;
        }

        const rootPath = folders[0].uri.fsPath;
        output.clear();
        output.show(true);
        output.appendLine(`Atlas: scanning ${rootPath}`);

        const entries = scanWorkspace(rootPath);
        const dependencies = extractDependencies(rootPath, entries);

        for (const entry of entries) {
            const label = entry.type === 'directory' ? '[dir] ' : '[file]';
            output.appendLine(`${label} ${entry.path}`);
        }

        if (dependencies.length > 0) {
            output.appendLine('');
            output.appendLine('Dependencies:');
            for (const dependency of dependencies) {
                output.appendLine(
                    `  ${dependency.name}${dependency.version ?? ''} (${dependency.sourceManifest})`
                );
            }
        }

        try {
            const { dbPath, counts } = await replaceMemory(rootPath, entries, dependencies);
            output.appendLine('');
            output.appendLine(
                `Atlas: stored ${counts.directories} directories, ${counts.files} files, ${counts.dependencies} dependencies -> ${dbPath}`
            );
            vscode.window.showInformationMessage(
                `Atlas: scanned ${counts.directories} directories, ${counts.files} files, ${counts.dependencies} dependencies.`
            );
            treeProvider.refresh();
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            output.appendLine('');
            output.appendLine(`Atlas: failed to write memory store - ${message}`);
            vscode.window.showErrorMessage(`Atlas: failed to write memory store - ${message}`);
        }
    });

    context.subscriptions.push(enableCommand, output, treeView);
}

export function deactivate(): void {}
