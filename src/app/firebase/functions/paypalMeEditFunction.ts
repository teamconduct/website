import { ValueTypeBuilder } from '../../typeBuilder';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const paypalMeEditFunction = new FirebaseFunction<{
    teamId: TeamId;
    paypalMeLink: string | null;
}, void>(new ValueTypeBuilder<null>());
