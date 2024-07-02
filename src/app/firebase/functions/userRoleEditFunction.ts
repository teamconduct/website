import { ValueTypeBuilder } from '../../typeBuilder';
import { UserId, UserRole } from '../../types';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const userRoleEditFunction = new FirebaseFunction<{
    userId: UserId
    teamId: TeamId
    roles: UserRole[]
}, void>(new ValueTypeBuilder<null>());
