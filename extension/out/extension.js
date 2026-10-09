"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const scanner_1 = require("./scanner");
const dependencies_1 = require("./dependencies");
const storage_1 = require("./storage");
const contextExport_1 = require("./contextExport");
const treeView_1 = require("./treeView");
function activate(context) {
    const output = vscode.window.createOutputChannel('Atlas');
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    const treeProvider = new treeView_1.AtlasMemoryProvider(workspaceRoot);
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
        const entries = (0, scanner_1.scanWorkspace)(rootPath);
        const dependencies = (0, dependencies_1.extractDependencies)(rootPath, entries);
        for (const entry of entries) {
            const label = entry.type === 'directory' ? '[dir] ' : '[file]';
            output.appendLine(`${label} ${entry.path}`);
        }
        if (dependencies.length > 0) {
            output.appendLine('');
            output.appendLine('Dependencies:');
            for (const dependency of dependencies) {
                output.appendLine(`  ${dependency.name}${dependency.version ?? ''} (${dependency.sourceManifest})`);
            }
        }
        try {
            const { dbPath, counts } = await (0, storage_1.replaceMemory)(rootPath, entries, dependencies);
            output.appendLine('');
            output.appendLine(`Atlas: stored ${counts.directories} directories, ${counts.files} files, ${counts.dependencies} dependencies -> ${dbPath}`);
            vscode.window.showInformationMessage(`Atlas: scanned ${counts.directories} directories, ${counts.files} files, ${counts.dependencies} dependencies.`);
            treeProvider.refresh();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            output.appendLine('');
            output.appendLine(`Atlas: failed to write memory store - ${message}`);
            vscode.window.showErrorMessage(`Atlas: failed to write memory store - ${message}`);
        }
    });
    const exportCommand = vscode.commands.registerCommand('atlas.exportContext', async () => {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            vscode.window.showErrorMessage('Atlas: open a folder first.');
            return;
        }
        const rootPath = folders[0].uri.fsPath;
        const snapshot = await (0, storage_1.readMemory)(rootPath);
        if (!snapshot) {
            vscode.window.showErrorMessage('Atlas: no memory yet — run "Atlas: Enable" first.');
            return;
        }
        const markdown = (0, contextExport_1.renderMemoryMarkdown)(path.basename(rootPath), snapshot);
        const outPath = path.join(rootPath, '.atlas', 'memory.md');
        fs.writeFileSync(outPath, markdown);
        output.appendLine(`Atlas: exported context -> ${outPath}`);
        vscode.window.showInformationMessage(`Atlas: exported context to ${outPath}`);
    });
    context.subscriptions.push(enableCommand, exportCommand, output, treeView);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map