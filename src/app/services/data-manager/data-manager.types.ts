import { Fine, FineTemplate, InAppNotification, Person, Team } from '@stevenkellner/team-conduct-api';
import { Flattable } from '@stevenkellner/typescript-common-functionality';

export interface PersistedDictionaryEntry<T> {
    id: string;
    value: T;
}

export interface PersistedTeamData {
    team: Flattable.Flatten<Team> | null;
    persons: PersistedDictionaryEntry<Flattable.Flatten<Person>>[] | null;
    fineTemplates: PersistedDictionaryEntry<Flattable.Flatten<FineTemplate>>[] | null;
    fines: PersistedDictionaryEntry<Flattable.Flatten<Fine>>[] | null;
}

export interface PersistedDataManagerState {
    userId: string;
    teams: PersistedDictionaryEntry<PersistedTeamData>[];
    notifications: PersistedDictionaryEntry<Flattable.Flatten<InAppNotification>>[] | null;
}
