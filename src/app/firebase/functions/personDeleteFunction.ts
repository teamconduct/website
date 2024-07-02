import { ValueTypeBuilder } from '../../typeBuilder';
import { PersonId } from '../../types';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const personDeleteFunction = new FirebaseFunction<{
    teamId: TeamId,
    id: PersonId
}, void>(new ValueTypeBuilder<null>());
