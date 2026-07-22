import * as path from 'path';
import * as vscode from 'vscode';
import { MemorySnapshot, StoredDependency, readMemory } from './storage';

type TreeNode =
    | { kind: 'directory'; path: string }
    | { kind: 'file'; path: string }
    | { kind: 'dependencies-group' }
    | { kind: 'manifest-group'; manifest: string }
    | { kind: 'dependency'; dependency: StoredDependency };

export class AtlasMemoryProvider implements vscode.TreeDataProvider<TreeNode> {
    private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<void>();
    readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

    constructor(private readonly workspaceRoot: string | undefined) {}

    refresh(): void {
        this.onDidChangeTreeDataEmitter.fire();
    }

    getTreeItem(element: TreeNode): vscode.TreeItem {
        switch (element.kind) {
            case 'directory': {
                const item = new vscode.TreeItem(
                    baseName(element.path),
                    vscode.TreeItemCollapsibleState.Collapsed
                );
                item.iconPath = vscode.ThemeIcon.Folder;
                item.tooltip = element.path;
                item.contextValue = 'atlasDirectory';
                return item;
            }
            case 'file': {
                const item = new vscode.TreeItem(baseName(element.path), vscode.TreeItemCollapsibleState.None);
                if (this.workspaceRoot) {
                    item.resourceUri = vscode.Uri.file(path.join(this.workspaceRoot, element.path));
                }
                item.tooltip = element.path;
                item.contextValue = 'atlasFile';
                return item;
            }
            case 'dependencies-group': {
                const item = new vscode.TreeItem('Dependencies', vscode.TreeItemCollapsibleState.Collapsed);
                item.iconPath = new vscode.ThemeIcon('package');
                return item;
            }
            case 'manifest-group': {
                const item = new vscode.TreeItem(element.manifest, vscode.TreeItemCollapsibleState.Collapsed);
                item.iconPath = new vscode.ThemeIcon('file-code');
                return item;
            }
            case 'dependency': {
                const label = `${element.dependency.name}${element.dependency.version ?? ''}`;
                const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
                item.iconPath = new vscode.ThemeIcon('symbol-package');
                return item;
            }
        }
    }

    async getChildren(element?: TreeNode): Promise<TreeNode[]> {
        if (!this.workspaceRoot) {
            return [];
        }

        const snapshot = await readMemory(this.workspaceRoot);
        if (!snapshot) {
            return [];
        }

        if (!element) {
            const topLevel = childEntries(snapshot, null);
            if (snapshot.dependencies.length > 0) {
                topLevel.push({ kind: 'dependencies-group' });
            }
            return topLevel;
        }

        if (element.kind === 'directory') {
            return childEntries(snapshot, element.path);
        }

        if (element.kind === 'dependencies-group') {
            const manifests = Array.from(new Set(snapshot.dependencies.map((d) => d.sourceManifest))).sort();
            return manifests.map((manifest): TreeNode => ({ kind: 'manifest-group', manifest }));
        }

        if (element.kind === 'manifest-group') {
            return snapshot.dependencies
                .filter((d) => d.sourceManifest === element.manifest)
                .map((dependency): TreeNode => ({ kind: 'dependency', dependency }));
        }

        return [];
    }
}

function childEntries(
    snapshot: Pick<MemorySnapshot, 'directories' | 'files'>,
    parentPath: string | null
): TreeNode[] {
    const directories: TreeNode[] = sortByPath(snapshot.directories.filter((d) => d.parentPath === parentPath)).map(
        (d): TreeNode => ({ kind: 'directory', path: d.path })
    );

    const files: TreeNode[] = sortByPath(snapshot.files.filter((f) => f.parentPath === parentPath)).map(
        (f): TreeNode => ({ kind: 'file', path: f.path })
    );

    return [...directories, ...files];
}

function sortByPath<T extends { path: string }>(entries: T[]): T[] {
    return [...entries].sort((a, b) => a.path.localeCompare(b.path));
}

function baseName(relativePath: string): string {
    return path.basename(relativePath) || relativePath;
}
