import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignInThirdPartyComponent } from './sign-in-third-party.component';
import { By } from '@angular/platform-browser';

describe('SignInThirdPartyComponent', () => {
    let component: SignInThirdPartyComponent;
    let fixture: ComponentFixture<SignInThirdPartyComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SignInThirdPartyComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(SignInThirdPartyComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should emit clicked event', () => {
        spyOn(component.onClick, 'emit');
        fixture.debugElement.query(By.css('#button button')).nativeElement.click();
        expect(component.onClick.emit).toHaveBeenCalled();
    });

    it('should not emit clicked event when disabled', () => {
        component.disabled = true;
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#button button')).nativeElement.classList).toContain('p-disabled');
        spyOn(component.onClick, 'emit');
        fixture.debugElement.query(By.css('#button button')).nativeElement.click();
        expect(component.onClick.emit).not.toHaveBeenCalled();
    });

    it('should not emit clicked event when loading', () => {
        component.loading = true;
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#button')).nativeElement.classList).toContain('loading');
        expect(fixture.debugElement.query(By.css('#button button')).nativeElement.classList).toContain('p-disabled');
        expect(fixture.debugElement.query(By.css('#button button')).nativeElement.classList).toContain('p-button-loading');
        spyOn(component.onClick, 'emit');
        fixture.debugElement.query(By.css('#button button')).nativeElement.click();
        expect(component.onClick.emit).not.toHaveBeenCalled();
    });

    it('should display google label', () => {
        component.type = 'google';
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#button')).nativeElement.classList).toContain('google');
        expect(component.label).toBe('Sign in with Google');
        expect(fixture.debugElement.query(By.css('#label')).nativeElement.textContent).toBe('Sign in with Google');
        expect(fixture.debugElement.query(By.css('#logo')).nativeElement).toBeTruthy();
    });

    it('should display apple label', () => {
        component.type = 'apple';
        fixture.detectChanges();
        expect(fixture.debugElement.query(By.css('#button')).nativeElement.classList).toContain('apple');
        expect(component.label).toBe('Sign in with Apple');
        expect(fixture.debugElement.query(By.css('#label')).nativeElement.textContent).toBe('Sign in with Apple');
        expect(fixture.debugElement.query(By.css('#logo')).nativeElement).toBeTruthy();
    });
});
