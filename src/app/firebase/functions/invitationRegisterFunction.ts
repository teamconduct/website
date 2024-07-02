import { ObjectTypeBuilder } from '../../typeBuilder';
import { PersonId } from '../../types';
import { InvitationId } from '../../types/Invitation';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const invitationRegisterFunction = new FirebaseFunction<InvitationId, {
    teamId: TeamId,
    personId: PersonId
}>(new ObjectTypeBuilder({
    teamId: TeamId.builder,
    personId: PersonId.builder
}));
