import { ValueTypeBuilder } from '../../typeBuilder';
import { FineTemplate } from '../../types';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const fineTemplateAddFunction = new FirebaseFunction<{
    teamId: TeamId,
    fineTemplate: FineTemplate
}, void>(new ValueTypeBuilder<null>());
