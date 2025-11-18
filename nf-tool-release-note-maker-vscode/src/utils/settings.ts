import * as vscode from 'vscode';

type ConfigSchema = Record<string, any>;

export class Settings<T extends ConfigSchema> {
    private configNamespace: string;
    private configKeys: T;

    constructor(configNamespace: string, configKeys: T) {
        this.configNamespace = configNamespace;
        this.configKeys = configKeys;

        const proxy = new Proxy(this, {
            get: (target, prop) => {
                if (prop in target.configKeys) {
                    const defaultValue = target.configKeys[prop as keyof T];
                    return vscode.workspace.getConfiguration(target.configNamespace).get(prop as string, defaultValue);
                }
                return (target as any)[prop];
            }
        });

        return proxy as unknown as Settings<T> & T;
    }
}

export function createSettings<T extends ConfigSchema>(ns: string, keys: T): Settings<T> & T {
    return new Settings(ns, keys) as Settings<T> & T;
}