import { ChangeDetectionStrategy, Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { AuthSignInComponent } from '../auth-sign-in/auth-sign-in.component';
import * as PrimeNGTranslationDE from '../../../locale/primeng.de.json';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, AuthSignInComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {

    private localeId = inject(LOCALE_ID);

    private primengConfig = inject(PrimeNGConfig);

    private faIconLibrary = inject(FaIconLibrary);

    public ngOnInit() {
        this.primengConfig.ripple = true;
        this.setPrimeNGTranslation();
        this.faIconLibrary.addIconPacks(fas);
        this.faIconLibrary.addIconPacks(far);
        this.faIconLibrary.addIconPacks(fab);
    }

    private setPrimeNGTranslation() {
        switch (this.localeId) {
        case 'de-DE':
            return this.primengConfig.setTranslation(PrimeNGTranslationDE);
        }
    }
}
