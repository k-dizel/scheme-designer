namespace SchemeDesigner {
    /**
     * Scheme
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    export class Scheme {
        /**
         * Canvas element
         */
        protected canvas: HTMLCanvasElement;

        /**
         * Canvas context
         */
        protected canvas2DContext: CanvasRenderingContext2D;

        /**
         * All objects
         */
        protected objects: SchemeObject[];

        /**
         * Objects bounding rect
         */
        protected objectsBoundingRect: BoundingRect;

        /**
         * Frame animation
         */
        protected requestFrameAnimation: any;

        /**
         * Cancel animation
         */
        protected cancelFrameAnimation: any;

        /**
         * Current number of rendering request
         */
        protected renderingRequestId: number = 0;


        /**
         * Device Pixel Ratio
         */
        protected devicePixelRatio: number = 1;

        /**
         * Event manager
         */
        protected eventManager: EventManager;

        /**
         * Scroll manager
         */
        protected scrollManager: ScrollManager;

        /**
         * Zoom manager
         */
        protected zoomManager: ZoomManager;

        /**
         * Default cursor style
         */
        protected defaultCursorStyle: string = 'default';

        /**
         * Constructor
         * @param {HTMLCanvasElement} canvas
         * @param {Object} params
         */
        constructor(canvas: HTMLCanvasElement, params?: any)
        {
            this.objects = [];

            this.canvas = canvas;

            this.canvas2DContext = this.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;

            this.requestFrameAnimation = Polyfill.getRequestAnimationFrameFunction();
            this.cancelFrameAnimation = Polyfill.getCancelAnimationFunction();
            this.devicePixelRatio = Polyfill.getDevicePixelRatio();

            /**
             * Managers
             */
            this.scrollManager = new ScrollManager(this);

            this.zoomManager = new ZoomManager(this);

            this.eventManager = new EventManager(this);


            /**
             * Configure
             */
            if (params) {
                Tools.configure(this.scrollManager, params.scroll);
                Tools.configure(this.zoomManager, params.zoom);
            }

            /**
             * Disable selections on canvas
             */
            this.disableCanvasSelection();

            /**
             * Bind events
             */
            this.eventManager.bindEvents();
        }

        /**
         * Get event manager
         * @returns {EventManager}
         */
        public getEventManager(): EventManager
        {
            return this.eventManager;
        }

        /**
         * Get scroll manager
         * @returns {ScrollManager}
         */
        public getScrollManager(): ScrollManager
        {
            return this.scrollManager;
        }

        /**
         * Get zoom manager
         * @returns {ZoomManager}
         */
        public getZoomManager(): ZoomManager
        {
            return this.zoomManager;
        }

        /**
         * Request animation
         * @param animation
         * @returns {number}
         */
        protected requestFrameAnimationApply(animation: Function): number
        {
            return this.requestFrameAnimation.apply(window, [animation]);
        }

        /**
         * Cancel animation
         * @param requestId
         */
        protected cancelAnimationFrameApply(requestId: number): void
        {
            return this.cancelFrameAnimation.apply(window, [requestId]);
        }

        /**
         * Clear canvas context
         */
        public clearContext(): this
        {
            this.canvas2DContext.clearRect(
                0,
                0,
                this.canvas.width / this.zoomManager.getScale(),
                this.canvas.height / this.zoomManager.getScale()
            );
            return this;
        }

        /**
         * Request render all
         */
        public requestRenderAll(): this
        {
            if (!this.renderingRequestId) {
                this.renderingRequestId = this.requestFrameAnimationApply(() => {this.renderAll()});
            }

            return this;
        }

        /**
         * todo render only visible objects
         * Render all objects
         */
        protected renderAll(): void
        {
            if (this.renderingRequestId) {
                this.cancelAnimationFrameApply(this.renderingRequestId);
                this.renderingRequestId = 0;
            }

            this.eventManager.sendEvent('beforeRenderAll');

            this.clearContext();

            for (let schemeObject of this.objects) {
                schemeObject.render(this);
            }

            this.eventManager.sendEvent('afterRenderAll');
        }

        /**
         * Add object
         * @param {SchemeObject} object
         */
        public addObject(object: SchemeObject): void
        {
            this.objects.push(object);
            this.reCalcObjectsBoundingRect();
        }

        /**
         * Remove object
         * @param {SchemeObject} object
         */
        public removeObject(object: SchemeObject): void
        {
            this.objects.filter(existObject => existObject !== object);
            this.reCalcObjectsBoundingRect();
        }

        /**
         * Remove all objects
         */
        public removeObjects(): void
        {
            this.objects = [];
        }

        /**
         * Canvas getter
         * @returns {HTMLCanvasElement}
         */
        public getCanvas(): HTMLCanvasElement
        {
            return this.canvas;
        }

        /**
         * Canvas context getter
         * @returns {CanvasRenderingContext2D}
         */
        public getCanvas2DContext(): CanvasRenderingContext2D
        {
            return this.canvas2DContext;
        }

        /**
         * Set cursor style
         * @param {string} cursor
         * @returns {SchemeDesigner}
         */
        public setCursorStyle(cursor: string): this
        {
            this.canvas.style.cursor = cursor;
            return this;
        }



        /**
         * find objects by coordinates
         * @param coordinates Coordinates
         * @returns {SchemeObject[]}
         */
        public findObjectsByCoordinates(coordinates: Coordinates): SchemeObject[]
        {
            let result: SchemeObject[] = [];

            // scale
            let x = coordinates.x;
            let y = coordinates.y;

            x = x / this.zoomManager.getScale();
            y = y / this.zoomManager.getScale();

            // scroll
            x = x - this.scrollManager.getScrollLeft();
            y = y - this.scrollManager.getScrollTop();


            for (let schemeObject of this.objects) {
                let boundingRect = schemeObject.getBoundingRect();
                if (boundingRect.left <= x && boundingRect.right >= x
                    && boundingRect.top <= y && boundingRect.bottom >= y) {
                    result.push(schemeObject)
                }
            }

            return result;
        }

        /**
         * All objects
         * @returns {SchemeObject[]}
         */
        public getObjects(): SchemeObject[]
        {
            return this.objects;
        }

        /**
         * Get default cursor style
         * @returns {string}
         */
        public getDefaultCursorStyle(): string
        {
            return this.defaultCursorStyle;
        }


        /**
         * Get bounding rect of all objects
         * @returns BoundingRect
         */
        public getObjectsBoundingRect(): BoundingRect
        {
            if (!this.objectsBoundingRect) {
                this.objectsBoundingRect = this.calculateObjectsBoundingRect();
            }
            return this.objectsBoundingRect;
        }

        /**
         * Recalculate bounding rect
         */
        public reCalcObjectsBoundingRect(): void
        {
            this.objectsBoundingRect = null;
        }


        /**
         * Get bounding rect of all objects
         * @returns {{left: number, top: number, right: number, bottom: number}}
         */
        public calculateObjectsBoundingRect(): BoundingRect
        {
            let top: number;
            let left: number;
            let right: number;
            let bottom: number;

            for (let schemeObject of this.objects) {
                let schemeObjectBoundingRect = schemeObject.getBoundingRect();

                if (top == undefined || schemeObjectBoundingRect.top < top) {
                    top = schemeObjectBoundingRect.top;
                }

                if (left == undefined || schemeObjectBoundingRect.left < left) {
                    left = schemeObjectBoundingRect.left;
                }

                if (right == undefined || schemeObjectBoundingRect.right > right) {
                    right = schemeObjectBoundingRect.right;
                }

                if (bottom == undefined || schemeObjectBoundingRect.bottom > bottom) {
                    bottom = schemeObjectBoundingRect.bottom;
                }
            }

            return {
                left: left,
                top: top,
                right: right,
                bottom: bottom
            };
        }

        /**
         * Disable selection on canvas
         */
        protected disableCanvasSelection(): void
        {
            let styles = [
                '-webkit-touch-callout',
                '-webkit-user-select',
                '-khtml-user-select',
                '-moz-user-select',
                '-ms-user-select',
                'user-select',
                'outline'
            ];
            for (let styleName of styles) {
                (this.canvas.style as any)[styleName] = 'none';
            }
        }
    }
}