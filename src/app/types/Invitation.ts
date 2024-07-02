import { TeamId } from './Team';
import { PersonId } from './Person';
import { ValueTypeBuilder, ObjectTypeBuilder } from '../typeBuilder';
import { Flatten } from './Flattable';
import { Tagged, TaggedTypeBuilder } from './Tagged';
import { Sha512 } from '../utils/sha512';

export type InvitationId = Tagged<string, 'invitation'>;

export namespace InvitationId {

    export const builder = new TaggedTypeBuilder<string, InvitationId>('invitation', new ValueTypeBuilder());

    export function create(invitation: Invitation): InvitationId {
        const rawId = new Sha512().hash(invitation.teamId.guidString, invitation.personId.guidString).slice(0, 12);
        return new Tagged(rawId, 'invitation');
    }
}

export type Invitation = {
    teamId: TeamId
    personId: PersonId
};

export namespace Invitation {
    export const builder = new ObjectTypeBuilder<Flatten<Invitation>, Invitation>({
        teamId: TeamId.builder,
        personId: PersonId.builder
    });
}
