import { ValueTypeBuilder } from '../../typeBuilder';
import { Person } from '../../types';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const personUpdateFunction = new FirebaseFunction<{
    teamId: TeamId,
    person: Omit<Person, 'fineIds' | 'signInProperties'>
}, void>(new ValueTypeBuilder<null>());
