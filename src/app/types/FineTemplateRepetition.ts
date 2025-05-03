import { ObjectTypeBuilder, ValueTypeBuilder } from '../typeBuilder';
import { Flatten } from './Flattable';

export type FineTemplateRepetition = {
    item: FineTemplateRepetition.Item,
    maxCount: number | null
}

export namespace FineTemplateRepetition {

    export type Item =
        | 'minute'
        | 'day'
        | 'item'
        | 'count';

    export namespace Item {

        export const all: Item[] = ['item', 'minute', 'day', 'count'];

        export function description(item: Item, type: 'standalone' | 'inText' = 'standalone', plural: boolean = false): string {
            if (type === 'inText') {
                switch (item) {
                case 'minute': return plural
                    ? $localize `:Description of fine template multiple item in text, plural minute:minutes`
                    : $localize `:Description of fine template multiple item in text, singular minute:minute`;
                case 'day': return plural
                    ? $localize `:Description of fine template multiple item in text, plural day:days`
                    : $localize `:Description of fine template multiple item in text, singular day:day`;
                case 'item': return plural
                    ? $localize `:Description of fine template multiple item in text, plural item:items`
                    : $localize `:Description of fine template multiple item in text, singular item:item`;
                case 'count': return plural
                    ? $localize `:Description of fine template multiple item in text, plural count:counts`
                    : $localize `:Description of fine template multiple item in text, singular count:count`;
                }
            } else {
                switch (item) {
                case 'minute': return plural
                    ? $localize `:Description of fine template multiple item standalone, plural minute:Minutes`
                    : $localize `:Description of fine template multiple item standalone, singular minute:Minute`;
                case 'day': return plural
                    ? $localize `:Description of fine template multiple item standalone, plural day:Days`
                    : $localize `:Description of fine template multiple item standalone, singular day:Day`;
                case 'item': return plural
                    ? $localize `:Description of fine template multiple item standalone, plural item:Items`
                    : $localize `:Description of fine template multiple item standalone, singular item:Item`;
                case 'count': return plural
                    ? $localize `:Description of fine template multiple item standalone, plural count:Counts`
                    : $localize `:Description of fine template multiple item standalone, singular count:Count`;
                }
            }
        }
    }

    export const builder = new ObjectTypeBuilder<Flatten<FineTemplateRepetition>, FineTemplateRepetition>({
        item: new ValueTypeBuilder(),
        maxCount: new ValueTypeBuilder()
    });

    export function description(multiple: FineTemplateRepetition): string {
        if (multiple.maxCount === null)
            return $localize `:Description of fine template multiple without max count:for each ${FineTemplateRepetition.Item.description(multiple.item, 'inText')}`;
        return $localize `:Description of fine template multiple with max count:for each ${FineTemplateRepetition.Item.description(multiple.item, 'inText')}, maximal ${multiple.maxCount} times`;
    }
}
