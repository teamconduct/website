import { InvitationId } from '../../types/Invitation';
import { FirebaseFunction } from '../FirebaseFunction';

export const invitationInviteFunction = new FirebaseFunction<InvitationId, InvitationId>(InvitationId.builder);
