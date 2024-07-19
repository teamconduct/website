import { ObjectTypeBuilder, ValueTypeBuilder } from '../typeBuilder';
import { Flatten } from './Flattable';

export type FineTemplateMultipleItem =
    | 'minute'
    | 'day'
    | 'item';

export namespace FineTemplateMultipleItem {

    export const all: FineTemplateMultipleItem[] = ['item', 'minute', 'day'];

    export function description(item: FineTemplateMultipleItem, type: 'standalone' | 'inText' = 'standalone'): string {
        if (type === 'inText') {
            switch (item) {
            case 'minute': return $localize `:Description of fine template multiple item in text, minute:minute`;
            case 'day': return $localize `:Description of fine template multiple item in text, day:day`;
            case 'item': return $localize `:Description of fine template multiple item in text, item:item`;
            }
        } else {
            switch (item) {
            case 'minute': return $localize `:Description of fine template multiple item standalone, minute:Minute`;
            case 'day': return $localize `:Description of fine template multiple item standalone, day:Day`;
            case 'item': return $localize `:Description of fine template multiple item standalone, item:Item`;
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
