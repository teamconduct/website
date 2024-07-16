import { PersonId, PersonPrivateProperties, User } from '../../types';
import { TeamId } from '../../types/Team';
import { FirebaseFunction } from '../FirebaseFunction';

export const teamNewFunction = new FirebaseFunction<{
    id: TeamId
    name: string
    paypalMeLink: string | null
    personId: PersonId
    personProperties: PersonPrivateProperties
}, User>(User.builder);
