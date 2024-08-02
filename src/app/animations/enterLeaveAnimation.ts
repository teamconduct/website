import { trigger, transition, style, animate } from '@angular/animations';

export const enterLeaveAnimation = trigger('enterLeaveAnimation', [
    transition(':enter', [style({ opacity: 0, height: 0 }), animate('100ms', style({ opacity: 1, height: '*' }))]),
    transition(':leave', [animate('100ms', style({ opacity: 0, height: 0 }))])
]);
