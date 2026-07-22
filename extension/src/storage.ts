import * as fs from 'fs';
import * as path from 'path';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { ScanEntry } from './scanner';
import { ManifestDependency } from './dependencies';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS directories (
    path TEXT NOT NULL,
    parent_path TEXT
);

CREATE TABLE IF NOT EXISTS files (
    path TEXT NOT NULL,
    parent_path TEXT,
    extension TEXT
);

CREATE TABLE IF NOT EXISTS dependencies (
    name TEXT NOT NULL,
    version TEXT,
    source_manifest TEXT NOT NULL
);
`;

export interface MemoryCounts {
    directories: number;
    files: number;
    dependencies: number;
}

export interface StoredDirectory {
    path: string;
    parentPath: string | null;
}

export interface StoredFile {
    path: string;
    parentPath: string | null;
    extension: string | null;
}

export interface StoredDependency {
    name: string;
    version: string | null;
    sourceManifest: string;
}

export interface MemorySnapshot {
    directories: StoredDirectory[];
    files: StoredFile[];
    dependencies: StoredDependency[];
}

function dbPathFor(workspaceRoot: string): string {
    return path.join(workspaceRoot, '.atlas', 'memory.db');
}

let sqlJsPromise: Promise<SqlJsStatic> | undefined;

function loadSqlJs(): Promise<SqlJsStatic> {
    if (!sqlJsPromise) {
        sqlJsPromise = initSqlJs({
            locateFile: (file: string) => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file),
        });
    }
    return sqlJsPromise;
}

export async function replaceMemory(
    workspaceRoot: string,
    entries: ScanEntry[],
    dependencies: ManifestDependency[]
): Promise<{ dbPath: string; counts: MemoryCounts }> {
    const atlasDir = path.join(workspaceRoot, '.atlas');
    if (!fs.existsSync(atlasDir)) {
        fs.mkdirSync(atlasDir);
    }
    const dbPath = dbPathFor(workspaceRoot);

    const SQL = await loadSqlJs();
    const db: Database = fs.existsSync(dbPath)
        ? new SQL.Database(fs.readFileSync(dbPath))
        : new SQL.Database();

    try {
        db.run(SCHEMA);
        db.run('BEGIN TRANSACTION');
        db.run('DELETE FROM directories');
        db.run('DELETE FROM files');
        db.run('DELETE FROM dependencies');

        let directoryCount = 0;
        let fileCount = 0;

        for (const entry of entries) {
            const parentPath = parentOf(entry.path);
            if (entry.type === 'directory') {
                db.run('INSERT INTO directories (path, parent_path) VALUES (?, ?)', [entry.path, parentPath]);
                directoryCount += 1;
            } else {
                const extension = path.extname(entry.path) || null;
                db.run('INSERT INTO files (path, parent_path, extension) VALUES (?, ?, ?)', [
                    entry.path,
                    parentPath,
                    extension,
                ]);
                fileCount += 1;
            }
        }

        for (const dependency of dependencies) {
            db.run('INSERT INTO dependencies (name, version, source_manifest) VALUES (?, ?, ?)', [
                dependency.name,
                dependency.version,
                dependency.sourceManifest,
            ]);
        }

        db.run('COMMIT');

        fs.writeFileSync(dbPath, Buffer.from(db.export()));

        return {
            dbPath,
            counts: { directories: directoryCount, files: fileCount, dependencies: dependencies.length },
        };
    } finally {
        db.close();
    }
}

/**
 * Reads memory directly from `.atlas/memory.db` on every call — deliberately
 * uncached so the tree view can never drift from what's on disk.
 * Returns null when no scan has run yet (empty-state case).
 */
export async function readMemory(workspaceRoot: string): Promise<MemorySnapshot | null> {
    const dbPath = dbPathFor(workspaceRoot);
    if (!fs.existsSync(dbPath)) {
        return null;
    }

    const SQL = await loadSqlJs();
    const db = new SQL.Database(fs.readFileSync(dbPath));

    try {
        return {
            directories: queryRows<StoredDirectory>(db, 'SELECT path, parent_path AS parentPath FROM directories'),
            files: queryRows<StoredFile>(db, 'SELECT path, parent_path AS parentPath, extension FROM files'),
            dependencies: queryRows<StoredDependency>(
                db,
                'SELECT name, version, source_manifest AS sourceManifest FROM dependencies'
            ),
        };
    } finally {
        db.close();
    }
}

function queryRows<T>(db: Database, sql: string): T[] {
    const result = db.exec(sql);
    if (result.length === 0) {
        return [];
    }
    const { columns, values } = result[0];
    return values.map((row) => {
        const record: Record<string, unknown> = {};
        columns.forEach((column, index) => {
            record[column] = row[index];
        });
        return record as T;
    });
}

function parentOf(relativePath: string): string | null {
    const separatorIndex = relativePath.lastIndexOf('/');
    return separatorIndex === -1 ? null : relativePath.slice(0, separatorIndex);
}
