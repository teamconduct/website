import { ValueTypeBuilder } from '../../typeBuilder';
import { PersonId } from '../../types';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const notificationRegisterFunction = new FirebaseFunction<{
    teamId: TeamId,
    personId: PersonId,
    token: string
}, void>(new ValueTypeBuilder<null>());
