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
exports.AtlasMemoryProvider = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const storage_1 = require("./storage");
class AtlasMemoryProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this.onDidChangeTreeDataEmitter = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;
    }
    refresh() {
        this.onDidChangeTreeDataEmitter.fire();
    }
    getTreeItem(element) {
        switch (element.kind) {
            case 'directory': {
                const item = new vscode.TreeItem(baseName(element.path), vscode.TreeItemCollapsibleState.Collapsed);
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
    async getChildren(element) {
        if (!this.workspaceRoot) {
            return [];
        }
        const snapshot = await (0, storage_1.readMemory)(this.workspaceRoot);
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
            return manifests.map((manifest) => ({ kind: 'manifest-group', manifest }));
        }
        if (element.kind === 'manifest-group') {
            return snapshot.dependencies
                .filter((d) => d.sourceManifest === element.manifest)
                .map((dependency) => ({ kind: 'dependency', dependency }));
        }
        return [];
    }
}
exports.AtlasMemoryProvider = AtlasMemoryProvider;
function childEntries(snapshot, parentPath) {
    const directories = sortByPath(snapshot.directories.filter((d) => d.parentPath === parentPath)).map((d) => ({ kind: 'directory', path: d.path }));
    const files = sortByPath(snapshot.files.filter((f) => f.parentPath === parentPath)).map((f) => ({ kind: 'file', path: f.path }));
    return [...directories, ...files];
}
function sortByPath(entries) {
    return [...entries].sort((a, b) => a.path.localeCompare(b.path));
}
function baseName(relativePath) {
    return path.basename(relativePath) || relativePath;
}
//# sourceMappingURL=treeView.js.map