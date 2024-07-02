import { ValueTypeBuilder } from '../../typeBuilder';
import { FineTemplateId } from '../../types';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const fineTemplateDeleteFunction = new FirebaseFunction<{
    teamId: TeamId,
    id: FineTemplateId
}, void>(new ValueTypeBuilder<null>());
