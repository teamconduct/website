import { ChangeDetectionStrategy, ChangeDetectorRef, Component, contentChild, inject, input, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

/**
 * A generic infinite carousel component that smoothly loops through slides without jumping.
 *
 * @example
 * ```html
 * <app-infinite-slides
 *   [slides]="mySlides"
 *   [colors]="{ 'dots-selected': '#FFF', 'dots-unselected': '#888' }"
 *   [intervalMs]="5000">
 *   <ng-template #slideTemplate let-slide>
 *     <h2>{{ slide.title }}</h2>
 *     <p>{{ slide.description }}</p>
 *   </ng-template>
 * </app-infinite-slides>
 * ```
 *
 * @typeParam T - The type of slide data
 */
@Component({
    selector: 'app-infinite-slides',
    imports: [NgTemplateOutlet],
    templateUrl: './infinite-slides.component.html',
    styleUrl: './infinite-slides.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfiniteSlidesComponent<T = any> implements OnInit, OnDestroy {

    private cdr = inject(ChangeDetectorRef);

    /// Timer ID for the automatic slide transition interval, used for cleanup on destroy
    private intervalId?: number;

    /// Array of slide data to display
    public slides = input.required<T[]>();

    /// Template reference for rendering each slide with custom content
    public slideTemplate = contentChild.required<TemplateRef<{ $implicit: T }>>('slideTemplate');

    /// Colors for the slide indicator dots
    public colors = input.required<Record<'dots-selected' | 'dots-unselected', string>>();

    /// Interval in milliseconds between automatic slide transitions
    public intervalMs = input<number>(5000);

    /// Duration in milliseconds for the slide transition animation
    public transitionDurationMs = input<number>(500);

    /// Current slide index (1-based to account for cloned slides)
    public currentSlideIndex = 1;

    /// Whether the slide transition animation is active
    public isTransitioning = true;

    /**
     * Extended slides array with cloned first and last slides for seamless infinite looping.
     * Structure: [lastSlide, ...originalSlides, firstSlide]
     */
    public get extendedSlides(): T[] {
        const slidesArray = this.slides();
        return [slidesArray[slidesArray.length - 1], ...slidesArray, slidesArray[0]];
    }

    /**
     * Gets the actual slide index (0-based) for the indicator dots,
     * accounting for the cloned slides in the extended array.
     */
    public get actualSlideIndex(): number {
        return (this.currentSlideIndex - 1 + this.slides().length) % this.slides().length;
    }

    public ngOnInit() {
        this.startSlideShow();
    }

    public ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    /**
     * Starts the automatic slideshow interval.
     * Increments the slide index and resets to position 1 when reaching the end,
     * creating a seamless infinite loop effect.
     */
    private startSlideShow() {
        this.intervalId = window.setInterval(() => {
            this.isTransitioning = true;
            this.currentSlideIndex++;
            this.cdr.markForCheck();

            if (this.currentSlideIndex === this.slides().length + 1) {
                setTimeout(() => {
                    this.isTransitioning = false;
                    this.currentSlideIndex = 1;
                    this.cdr.markForCheck();
                }, this.transitionDurationMs());
            }
        }, this.intervalMs());
    }
}
