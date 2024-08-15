import { User } from '../../types';
import { InvitationId } from '../../types/Invitation';
import { FirebaseFunction } from '../FirebaseFunction';

export const invitationRegisterFunction = new FirebaseFunction<InvitationId, User>(User.builder);
