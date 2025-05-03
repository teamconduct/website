import { ValueTypeBuilder } from '../../typeBuilder';
import { PersonId, FineId } from '../../types';
import { Configuration } from '../../types/Configuration';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const fineDeleteFunction = new FirebaseFunction<{
    teamId: TeamId,
    personId: PersonId,
    id: FineId,
    configuration: Configuration
}, void>(new ValueTypeBuilder<null>());
