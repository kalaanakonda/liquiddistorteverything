import type { PartialOptions } from './types';
export declare class LiquidDistort {
    private el;
    private opts;
    private svgEl;
    private feImg;
    private feDisplace;
    private filterId;
    private mapCanvas;
    private ctx;
    private physics;
    private mouseX;
    private mouseY;
    private isInside;
    private clickActive;
    private rafId;
    private lastTime;
    private onMouseMove;
    private onMouseEnter;
    private onMouseLeave;
    private onMouseClick;
    constructor(element: HTMLElement, options?: PartialOptions);
    /** Update options live — takes effect on next frame. */
    setOptions(options: PartialOptions): void;
    /** Remove all DOM changes and stop the animation loop. */
    destroy(): void;
    private init;
    private render;
    private updateMap;
    private pushToFilter;
}
