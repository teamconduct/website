import { ValueTypeBuilder } from '../../typeBuilder';
import { PersonId, UserId, UserRole } from '../../types';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const userRoleEditFunction = new FirebaseFunction<{
    teamId: TeamId
    personId: PersonId
    roles: UserRole[]
}, void>(new ValueTypeBuilder<null>());
