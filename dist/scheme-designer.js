/**
 * SchemeDesigner class
 */
var SchemeDesigner = /** @class */ (function () {
    /**
     * Constructor
     * @param {HTMLCanvasElement} canvas
     */
    function SchemeDesigner(canvas) {
        /**
         * Frame interval delay
         */
        this.frameIntervalDelay = 20;
        /**
         * Requested render all
         */
        this.renderAllRequested = false;
        /**
         * Hovered objects
         */
        this.hoveredObjects = [];
        this.objects = [];
        this.canvas = canvas;
        this.canvas2DContext = this.canvas.getContext('2d');
        this.resetFrameInterval();
        this.bindEvents();
    }
    /**
     * Frame controller
     */
    SchemeDesigner.prototype.frame = function () {
        if (this.renderAllRequested) {
            this.renderAll();
            this.renderAllRequested = false;
        }
    };
    /**
     * Reset frame interval
     */
    SchemeDesigner.prototype.resetFrameInterval = function () {
        var _this = this;
        if (this.frameIntervalToken) {
            clearInterval(this.frameIntervalToken);
        }
        this.frameIntervalToken = setInterval(function () { return _this.frame(); }, this.frameIntervalDelay);
    };
    /**
     * Clear canvas context
     */
    SchemeDesigner.prototype.clearContext = function () {
        this.canvas2DContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return this;
    };
    /**
     * Request render all
     */
    SchemeDesigner.prototype.requestRenderAll = function () {
        this.renderAllRequested = true;
        return this;
    };
    /**
     * Render all objects
     */
    SchemeDesigner.prototype.renderAll = function () {
        this.sendEvent('renderAllStart');
        this.clearContext();
        for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
            var schemeObject = _a[_i];
            schemeObject.render(this);
        }
        this.sendEvent('renderAllEnd');
    };
    /**
     * Send event
     * @param {string} eventName
     * @param data
     */
    SchemeDesigner.prototype.sendEvent = function (eventName, data) {
        var event = new CustomEvent('schemeDesigner.' + eventName, {
            detail: data
        });
        this.canvas.dispatchEvent(event);
    };
    /**
     * Add object
     * @param {SchemeObject} object
     */
    SchemeDesigner.prototype.addObject = function (object) {
        this.objects.push(object);
    };
    /**
     * Remove object
     * @param {SchemeObject} object
     */
    SchemeDesigner.prototype.removeObject = function (object) {
        this.objects.filter(function (existObject) { return existObject !== object; });
    };
    /**
     * Remove all objects
     */
    SchemeDesigner.prototype.removeObjects = function () {
        this.objects = [];
    };
    /**
     * Canvas getter
     * @returns {HTMLCanvasElement}
     */
    SchemeDesigner.prototype.getCanvas = function () {
        return this.canvas;
    };
    /**
     * Canvas context getter
     * @returns {CanvasRenderingContext2D}
     */
    SchemeDesigner.prototype.getCanvas2DContext = function () {
        return this.canvas2DContext;
    };
    /**
     * Set frame interval delay
     * @param frameIntervalDelay
     * @returns {SchemeDesigner}
     */
    SchemeDesigner.prototype.setFrameIntervalDelay = function (frameIntervalDelay) {
        this.frameIntervalDelay = frameIntervalDelay;
        return this;
    };
    /**
     * Bind events
     */
    SchemeDesigner.prototype.bindEvents = function () {
        var _this = this;
        // mouse events
        this.canvas.addEventListener('mousedown', function (e) { _this.onMouseDown(e); });
        this.canvas.addEventListener('click', function (e) { _this.onClick(e); });
        this.canvas.addEventListener('dblclick', function (e) { _this.onDoubleClick(e); });
        this.canvas.addEventListener('mousemove', function (e) { _this.onMouseMove(e); });
        this.canvas.addEventListener('mouseout', function (e) { _this.onMouseOut(e); });
        this.canvas.addEventListener('mouseenter', function (e) { _this.onMouseEnter(e); });
        this.canvas.addEventListener('wheel', function (e) { _this.onMouseWheel(e); });
        this.canvas.addEventListener('contextmenu', function (e) { _this.onContextMenu(e); });
        // touch events
        // todo touchstart
        // todo touchmove
    };
    /**
     * todo
     * @param e
     */
    SchemeDesigner.prototype.onMouseDown = function (e) {
    };
    /**
     * On click
     * @param e
     */
    SchemeDesigner.prototype.onClick = function (e) {
        var objects = this.findObjectsForEvent(e);
        for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
            var schemeObject = objects_1[_i];
            schemeObject.isSelected = !schemeObject.isSelected;
            this.sendEvent('clickOnObject', schemeObject);
        }
        if (objects.length) {
            this.requestRenderAll();
        }
    };
    /**
     * todo
     * @param e
     */
    SchemeDesigner.prototype.onDoubleClick = function (e) {
    };
    /**
     * On mouse move
     * @param e
     */
    SchemeDesigner.prototype.onMouseMove = function (e) {
        var objects = this.findObjectsForEvent(e);
        var mustReRender = false;
        var hasNewHovers = false;
        if (this.hoveredObjects.length) {
            for (var _i = 0, _a = this.hoveredObjects; _i < _a.length; _i++) {
                var schemeHoveredObject = _a[_i];
                // already hovered
                var alreadyHovered = false;
                for (var _b = 0, objects_2 = objects; _b < objects_2.length; _b++) {
                    var schemeObject = objects_2[_b];
                    if (schemeObject == schemeHoveredObject) {
                        alreadyHovered = true;
                    }
                }
                if (!alreadyHovered) {
                    schemeHoveredObject.isHovered = false;
                    mustReRender = true;
                    hasNewHovers = true;
                }
            }
        }
        if (!this.hoveredObjects.length || hasNewHovers) {
            for (var _c = 0, objects_3 = objects; _c < objects_3.length; _c++) {
                var schemeObject = objects_3[_c];
                schemeObject.isHovered = true;
                mustReRender = true;
                this.sendEvent('hoverOnObject', schemeObject);
            }
        }
        this.hoveredObjects = objects;
        if (mustReRender) {
            this.requestRenderAll();
        }
    };
    /**
     * todo
     * @param e
     */
    SchemeDesigner.prototype.onMouseOut = function (e) {
    };
    /**
     * todo
     * @param e
     */
    SchemeDesigner.prototype.onMouseEnter = function (e) {
    };
    /**
     * todo
     * @param e
     */
    SchemeDesigner.prototype.onMouseWheel = function (e) {
    };
    /**
     * todo
     * @param e
     */
    SchemeDesigner.prototype.onContextMenu = function (e) {
    };
    /**
     * Find objects by event
     * @param e
     * @returns {SchemeObject[]}
     */
    SchemeDesigner.prototype.findObjectsForEvent = function (e) {
        var coordinates = this.getCoordinatesFromEvent(e);
        return this.findObjectsByCoordinates(coordinates[0], coordinates[1]);
    };
    /**
     * Get coordinates from event
     * @param e
     * @returns {number[]}
     */
    SchemeDesigner.prototype.getCoordinatesFromEvent = function (e) {
        var clientRect = this.canvas.getBoundingClientRect();
        var x = e.clientX - clientRect.left;
        var y = e.clientY - clientRect.top;
        return [x, y];
    };
    /**
     * find objects by coordinates
     * @param x
     * @param y
     * @returns {SchemeObject[]}
     */
    SchemeDesigner.prototype.findObjectsByCoordinates = function (x, y) {
        var result = [];
        for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
            var schemeObject = _a[_i];
            var boundingRect = schemeObject.getBoundingRect();
            if (boundingRect.left <= x && boundingRect.right >= x
                && boundingRect.top <= y && boundingRect.bottom >= y) {
                result.push(schemeObject);
            }
        }
        return result;
    };
    return SchemeDesigner;
}());

/**
 * SchemeObject class
 */
var SchemeObject = /** @class */ (function () {
    /**
     * Constructor
     * @param {Object} params
     */
    function SchemeObject(params) {
        /**
         * Is hovered
         */
        this.isHovered = false;
        /**
         * Is selected
         */
        this.isSelected = false;
        this.x = params.x;
        this.y = params.y;
        this.width = params.width;
        this.height = params.height;
        this.renderFunction = params.renderFunction;
        this.params = params;
    }
    /**
     * Rendering object
     */
    SchemeObject.prototype.render = function (schemeDesigner) {
        this.renderFunction(this, schemeDesigner);
    };
    /**
     * Bounding rect
     * @returns {{left: number, top: number, right: number, bottom: number}}
     */
    SchemeObject.prototype.getBoundingRect = function () {
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.width,
            bottom: this.y + this.height
        };
    };
    return SchemeObject;
}());