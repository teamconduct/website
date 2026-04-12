import { User } from '@stevenkellner/team-conduct-api';

export class PersistentData<T> {

    public constructor(
        public readonly key: string,
        private readonly storage: Storage = window.localStorage
    ) {}

    public load(): T | null {
        const value = this.storage.getItem(this.key);
        if (value === null)
            return null;

        try {
            return JSON.parse(value) as T;
        } catch {
            this.remove();
            return null;
        }
    }

    public save(value: T): void {
        this.storage.setItem(this.key, JSON.stringify(value));
    }

    public remove(): void {
        this.storage.removeItem(this.key);
    }
}

export interface PersistedAppState {
    user: User.Flatten | null;
    selectedTeamId: string | null;
}

export const persistentDataKeys = {
    appState: 'team-conduct:app-state',
    dataManager: 'team-conduct:data-manager'
} as const;
