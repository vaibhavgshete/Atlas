import * as fs from 'fs';
import * as path from 'path';
import ignore, { Ignore } from 'ignore';

export interface ScanEntry {
    type: 'directory' | 'file';
    path: string;
}

const BUILTIN_IGNORES = ['.git', 'node_modules', '.atlas'];

function loadIgnoreRules(rootPath: string): Ignore {
    const ig = ignore().add(BUILTIN_IGNORES);
    const gitignorePath = path.join(rootPath, '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        ig.add(fs.readFileSync(gitignorePath, 'utf8'));
    }
    return ig;
}

function toPosixPath(relativePath: string): string {
    return relativePath.split(path.sep).join('/');
}

export function scanWorkspace(rootPath: string): ScanEntry[] {
    const ig = loadIgnoreRules(rootPath);
    const entries: ScanEntry[] = [];

    function walk(currentDir: string): void {
        const dirents = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const dirent of dirents) {
            const absolutePath = path.join(currentDir, dirent.name);
            const relativePath = toPosixPath(path.relative(rootPath, absolutePath));

            if (dirent.isDirectory()) {
                if (ig.ignores(relativePath) || ig.ignores(`${relativePath}/`)) {
                    continue;
                }
                entries.push({ type: 'directory', path: relativePath });
                walk(absolutePath);
            } else if (dirent.isFile()) {
                if (ig.ignores(relativePath)) {
                    continue;
                }
                entries.push({ type: 'file', path: relativePath });
            }
        }
    }

    walk(rootPath);
    return entries;
}
