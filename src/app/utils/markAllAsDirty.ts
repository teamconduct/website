import { FormGroup } from '@angular/forms';

export function markAllAsDirty(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
        const control = formGroup.get(key);
        if (control instanceof FormGroup)
            markAllAsDirty(control);
        control?.markAsDirty();
    });
}
