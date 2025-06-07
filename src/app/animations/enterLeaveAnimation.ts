import { trigger, transition, style, animate, AnimationMetadata } from '@angular/animations';

export function getEnterLeaveAnimation(durationMs: number = 100): AnimationMetadata {
    return trigger('enterLeaveAnimation', [
        transition(':enter', [style({ opacity: 0, height: 0 }), animate(`${durationMs}ms`, style({ opacity: 1, height: '*' }))]),
        transition(':leave', [animate(`${durationMs}ms`, style({ opacity: 0, height: 0 }))])
    ]);
}
