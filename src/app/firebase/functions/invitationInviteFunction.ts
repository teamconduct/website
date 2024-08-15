import { Invitation, InvitationId } from '../../types/Invitation';
import { FirebaseFunction } from '../FirebaseFunction';

export const invitationInviteFunction = new FirebaseFunction<Invitation, InvitationId>(InvitationId.builder);
