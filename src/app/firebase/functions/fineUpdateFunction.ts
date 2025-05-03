import { ValueTypeBuilder } from '../../typeBuilder';
import { PersonId, Fine } from '../../types';
import { Configuration } from '../../types/Configuration';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const fineUpdateFunction = new FirebaseFunction<{
    teamId: TeamId,
    personId: PersonId,
    fine: Fine,
    configuration: Configuration
}, void>(new ValueTypeBuilder<null>());
