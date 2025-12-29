import { Locale, PayedState } from "@stevenkellner/team-conduct-api";
import { Tag } from "primeng/tag";

export class PayedTag {

    public constructor(
        private readonly state: PayedState
    ) {}

    public formatted(locale: Locale): string {
        return PayedState.formatted(this.state, locale);
    }

    public get severity(): Tag['severity'] {
        switch (this.state) {
        case 'payed':
            return 'secondary';
        case 'notPayed':
            return 'danger';
        }
    }

    public toFormatted(locale: Locale): PayedTag.Formatted {
        return {
            value: this.formatted(locale),
            severity: this.severity
        };
    }
}

export namespace PayedTag {

    export type Formatted = {
        value: string;
        severity: Tag['severity'];
    }
}
