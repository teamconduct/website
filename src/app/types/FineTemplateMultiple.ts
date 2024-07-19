import { ObjectTypeBuilder, ValueTypeBuilder } from '../typeBuilder';
import { Flatten } from './Flattable';

export type FineTemplateMultipleItem =
    | 'minute'
    | 'day'
    | 'item';

export namespace FineTemplateMultipleItem {

    export const all: FineTemplateMultipleItem[] = ['item', 'minute', 'day'];

    export function description(item: FineTemplateMultipleItem, type: 'standalone' | 'inText' = 'standalone', plural: boolean = false): string {
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
            }
        }
    }
}

export type FineTemplateMultiple = {
    item: FineTemplateMultipleItem,
    maxCount: number | null
}

export namespace FineTemplateMultiple {
    export const builder = new ObjectTypeBuilder<Flatten<FineTemplateMultiple>, FineTemplateMultiple>({
        item: new ValueTypeBuilder(),
        maxCount: new ValueTypeBuilder()
    });

    export function description(multiple: FineTemplateMultiple): string {
        if (multiple.maxCount === null)
            return $localize `:Description of fine template multiple without max count:for each ${FineTemplateMultipleItem.description(multiple.item, 'inText')}`;
        return $localize `:Description of fine template multiple with max count:for each ${FineTemplateMultipleItem.description(multiple.item, 'inText')}, maximal ${multiple.maxCount} times`;
    }
}
