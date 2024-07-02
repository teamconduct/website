import { ValueTypeBuilder } from '../../typeBuilder';
import { Invitation } from '../../types/Invitation';
import { FirebaseFunction } from '../FirebaseFunction';

export const invitationWithdrawFunction = new FirebaseFunction<Invitation, void>(new ValueTypeBuilder<null>());
