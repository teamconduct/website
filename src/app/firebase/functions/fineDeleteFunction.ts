import { ValueTypeBuilder } from '../../typeBuilder';
import { PersonId, FineId } from '../../types';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const fineDeleteFunction = new FirebaseFunction<{
    teamId: TeamId,
    personId: PersonId,
    id: FineId
}, void>(new ValueTypeBuilder<null>());
