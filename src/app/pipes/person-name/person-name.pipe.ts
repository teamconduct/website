import { Pipe, PipeTransform } from '@angular/core';
import { Person, User } from '@stevenkellner/team-conduct-api';

export type PersonNameStyle = 'full' | 'short' | 'initials';

@Pipe({
    name: 'personName',
    standalone: true
})
export class PersonNamePipe implements PipeTransform {

    public transform(userOrPerson: User | Person, style: PersonNameStyle = 'full'): string {
        const firstName = userOrPerson instanceof User ? userOrPerson.properties.firstName : userOrPerson.properties.firstName;
        const lastName = userOrPerson instanceof User ? userOrPerson.properties.lastName : userOrPerson.properties.lastName;
        if (style === 'full')
            return `${firstName} ${lastName}`;
        if (style === 'short')
            return `${firstName} ${lastName.charAt(0)}.`;
        if (style === 'initials')
            return `${firstName.charAt(0)}.${lastName.charAt(0)}.`;
        return '';
    }
}
