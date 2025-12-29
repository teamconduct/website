import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import * as primeNGTranslationDE from '../locale/primeng.de.json';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { ConfigurationService } from './services/configuration/configuration.service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    template: '<router-outlet/>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class App implements OnInit {

    private readonly configurationService = inject(ConfigurationService);

    private readonly primeNGConfig = inject(PrimeNG)

    private faIconLibrary = inject(FaIconLibrary);

    public ngOnInit() {
        this.faIconLibrary.addIconPacks(fas);
        this.faIconLibrary.addIconPacks(far);
        this.faIconLibrary.addIconPacks(fab);
        switch (this.configurationService.locale) {
            case 'en': {
                // PrimeNG uses English as default language
                break;
            }
            case 'de': {
                this.primeNGConfig.setTranslation(primeNGTranslationDE);
                break;
            }
        }
    }
}
