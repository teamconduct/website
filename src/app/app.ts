import { ChangeDetectionStrategy, Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import * as primeNGTranslationDE from '../locale/primeng.de.json';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    template: '<router-outlet/>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {

    private readonly localeId = inject(LOCALE_ID);

    private readonly primeNGConfig = inject(PrimeNG)

    public ngOnInit() {
        switch (this.localeId) {
        case 'de-DE':
            return this.primeNGConfig.setTranslation(primeNGTranslationDE);
        }
    }
}
