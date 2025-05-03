import { ValueTypeBuilder } from '../../typeBuilder';
import { PersonId, PersonPrivateProperties } from '../../types';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const personUpdateFunction = new FirebaseFunction<{
    teamId: TeamId,
    id: PersonId,
    properties: PersonPrivateProperties
}, void>(new ValueTypeBuilder<null>());
