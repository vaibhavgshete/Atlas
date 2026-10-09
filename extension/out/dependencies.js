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
exports.extractDependencies = extractDependencies;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const MANIFEST_PARSERS = {
    'package.json': parsePackageJson,
    'requirements.txt': parseRequirementsTxt,
};
function extractDependencies(workspaceRoot, entries) {
    const dependencies = [];
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
function parsePackageJson(content, manifestPath) {
    let parsed;
    try {
        parsed = JSON.parse(content);
    }
    catch {
        return [];
    }
    if (typeof parsed !== 'object' || parsed === null) {
        return [];
    }
    const dependencies = [];
    for (const section of ['dependencies', 'devDependencies']) {
        const sectionValue = parsed[section];
        if (typeof sectionValue !== 'object' || sectionValue === null) {
            continue;
        }
        for (const [name, version] of Object.entries(sectionValue)) {
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
const REQUIREMENT_PATTERN = /^([A-Za-z0-9][A-Za-z0-9._-]*)(?:\[[^\]]*\])?\s*(==|>=|<=|~=|!=|>|<)?\s*([^\s;#]*)/;
function parseRequirementsTxt(content, manifestPath) {
    const dependencies = [];
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
//# sourceMappingURL=dependencies.js.map