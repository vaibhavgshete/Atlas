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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceMemory = replaceMemory;
exports.readMemory = readMemory;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sql_js_1 = __importDefault(require("sql.js"));
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
function dbPathFor(workspaceRoot) {
    return path.join(workspaceRoot, '.atlas', 'memory.db');
}
let sqlJsPromise;
function loadSqlJs() {
    if (!sqlJsPromise) {
        sqlJsPromise = (0, sql_js_1.default)({
            locateFile: (file) => path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file),
        });
    }
    return sqlJsPromise;
}
async function replaceMemory(workspaceRoot, entries, dependencies) {
    const atlasDir = path.join(workspaceRoot, '.atlas');
    if (!fs.existsSync(atlasDir)) {
        fs.mkdirSync(atlasDir);
    }
    const dbPath = dbPathFor(workspaceRoot);
    const SQL = await loadSqlJs();
    const db = fs.existsSync(dbPath)
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
            }
            else {
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
    }
    finally {
        db.close();
    }
}
/**
 * Reads memory directly from `.atlas/memory.db` on every call — deliberately
 * uncached so the tree view can never drift from what's on disk.
 * Returns null when no scan has run yet (empty-state case).
 */
async function readMemory(workspaceRoot) {
    const dbPath = dbPathFor(workspaceRoot);
    if (!fs.existsSync(dbPath)) {
        return null;
    }
    const SQL = await loadSqlJs();
    const db = new SQL.Database(fs.readFileSync(dbPath));
    try {
        return {
            directories: queryRows(db, 'SELECT path, parent_path AS parentPath FROM directories'),
            files: queryRows(db, 'SELECT path, parent_path AS parentPath, extension FROM files'),
            dependencies: queryRows(db, 'SELECT name, version, source_manifest AS sourceManifest FROM dependencies'),
        };
    }
    finally {
        db.close();
    }
}
function queryRows(db, sql) {
    const result = db.exec(sql);
    if (result.length === 0) {
        return [];
    }
    const { columns, values } = result[0];
    return values.map((row) => {
        const record = {};
        columns.forEach((column, index) => {
            record[column] = row[index];
        });
        return record;
    });
}
function parentOf(relativePath) {
    const separatorIndex = relativePath.lastIndexOf('/');
    return separatorIndex === -1 ? null : relativePath.slice(0, separatorIndex);
}
//# sourceMappingURL=storage.js.map