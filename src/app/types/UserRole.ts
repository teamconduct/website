export type UserRole =
    | 'person-manager'
    | 'fineTemplate-manager'
    | 'fine-manager'
    | 'team-manager';

export namespace UserRole {
    export const all: UserRole[] = [
        'team-manager',
        'person-manager',
        'fineTemplate-manager',
        'fine-manager'
    ];

    export function description(role: UserRole): string {
        switch (role) {
        case 'team-manager':
            return $localize `:Description of the team manager role:Team manager`;
        case 'person-manager':
            return $localize `:Description of the person manager role:Person manager`;
        case 'fineTemplate-manager':
            return $localize `:Description of the fine template manager role:Fine template manager`;
        case 'fine-manager':
            return $localize `:Description of the fine manager role:Fine manager`;
        }
    }
}
