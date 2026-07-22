import * as fs from 'fs';
import * as path from 'path';
import { ScanEntry } from './scanner';

export interface ManifestDependency {
    name: string;
    version: string | null;
    sourceManifest: string;
}

type ManifestParser = (content: string, manifestPath: string) => ManifestDependency[];

const MANIFEST_PARSERS: Record<string, ManifestParser> = {
    'package.json': parsePackageJson,
    'requirements.txt': parseRequirementsTxt,
};

export function extractDependencies(workspaceRoot: string, entries: ScanEntry[]): ManifestDependency[] {
    const dependencies: ManifestDependency[] = [];

    for (const entry of entries) {
        if (entry.type !== 'file') {
            continue;
        }
        const parser = MANIFEST_PARSERS[path.basename(entry.path)];
        if (!parser) {
            continue;
        }

        const absolutePath = path.join(workspaceRoot, entry.path);
        const content = fs.readFileSync(absolutePath, 'utf8');
        dependencies.push(...parser(content, entry.path));
    }

    return dependencies;
}

function parsePackageJson(content: string, manifestPath: string): ManifestDependency[] {
    let parsed: unknown;
    try {
        parsed = JSON.parse(content);
    } catch {
        return [];
    }

    if (typeof parsed !== 'object' || parsed === null) {
        return [];
    }

    const dependencies: ManifestDependency[] = [];
    for (const section of ['dependencies', 'devDependencies']) {
        const sectionValue = (parsed as Record<string, unknown>)[section];
        if (typeof sectionValue !== 'object' || sectionValue === null) {
            continue;
        }
        for (const [name, version] of Object.entries(sectionValue as Record<string, unknown>)) {
            dependencies.push({
                name,
                version: typeof version === 'string' ? version : null,
                sourceManifest: manifestPath,
            });
        }
    }
    return dependencies;
}

// Matches `name`, `name[extras]`, and an optional version specifier, e.g.
// "psycopg[binary]==3.3.4" -> name "psycopg", version "==3.3.4".
const REQUIREMENT_PATTERN =
    /^([A-Za-z0-9][A-Za-z0-9._-]*)(?:\[[^\]]*\])?\s*(==|>=|<=|~=|!=|>|<)?\s*([^\s;#]*)/;

function parseRequirementsTxt(content: string, manifestPath: string): ManifestDependency[] {
    const dependencies: ManifestDependency[] = [];

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#') || line.startsWith('-')) {
            continue;
        }

        const match = REQUIREMENT_PATTERN.exec(line);
        if (!match) {
            continue;
        }

        const [, name, operator, versionValue] = match;
        const version = operator && versionValue ? `${operator}${versionValue}` : null;
        dependencies.push({ name, version, sourceManifest: manifestPath });
    }

    return dependencies;
}
