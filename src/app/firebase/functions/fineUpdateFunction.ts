import { ValueTypeBuilder } from '../../typeBuilder';
import { PersonId, Fine } from '../../types';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const fineUpdateFunction = new FirebaseFunction<{
    teamId: TeamId,
    personId: PersonId,
    fine: Fine
}, void>(new ValueTypeBuilder<null>());
