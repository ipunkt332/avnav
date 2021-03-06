/**
 * Created by andreas on 26.06.14.
 * 2d context drawing functions
 * as all the ol3 stuff is hard to use or broken...
 */

avnav.provide('avnav.map.Drawing');
avnav.provide('avnav.map.DrawingPositionConverter');


/**
 * an interface for converting between lat/lon and css pixel
 * @constructor
 */
avnav.map.DrawingPositionConverter=function(){
};
/**
 * to be overloaded
 * @param {ol.Coordinate} point
 * @returns {undefined}
 */
avnav.map.DrawingPositionConverter.prototype.coordToPixel=function(point){
    return undefined;
};
/**
 * convert from pixel (as provided by an event) to map coordinates
 * @param pixel
 * @returns {ol.Coordinate}
 */
avnav.map.DrawingPositionConverter.prototype.pixelToCoord=function(pixel){
    return new ol.Coordinate();
};

/**
 * 2d drawing functions
 * @constructor
 * @param {avnav.map.DrawingPositionConverter} converter
 * @param {number} opt_ratio - device pixel ratio
 */
avnav.map.Drawing=function(converter,opt_ratio){
    /**
     * the device pixel ratio
     * @private
     * @type {number}
     */
    this.devPixelRatio=1;
    if (opt_ratio) this.devPixelRatio=opt_ratio;
    /**
     * the global rotation - will be added to rotations
     * if rotateWithView is set
     * @type {number}
     * @private
     */
    this.rotation=0;
    /**
     * @private
     * @type {avnav.map.DrawingPositionConverter}
     */
    this.converter=converter;
    /**
     * the context to be used for drawing
     * @private
     * @type {CanvasRenderingContext2D}
     */
    this.context=undefined;
    var self=this;
    $(document).on(avnav.util.PropertyChangeEvent.EVENT_TYPE, function(ev,evdata){
        self.propertyChange(evdata);
    });

};

/**
 * draw a circle determined by a center point an one other point
 * @param {ol.Coordinate} center
 * @param {ol.Coordinate} other
 * @param opt_styles - see drawLineToContext
 * @return the center in css pixel
 */
avnav.map.Drawing.prototype.drawCircleToContext=function(center,other,opt_styles){
    if (! this.context) return;
    this.setLineStyles(opt_styles);
    var rt=this.pointToCssPixel(center);
    var cp=this.pixelToDevice(rt);
    var op=this.pixelToDevice(this.pointToCssPixel(other));
    var xd=op[0]-cp[0];
    var yd=op[1]-cp[1];
    var r=Math.sqrt(xd*xd+yd*yd);
    this.context.beginPath();
    this.context.arc(cp[0],cp[1],r,0, 2 * Math.PI);
    this.context.stroke();
    return rt;
};

/**
 * @param {ol.Coordinate} point the position in map coordinates
 * @param {image} the image to display (must be loaded - no check!)
 * @param {Object} opt_options handles the same properties like ol.style.Icon
 *             currently supported:
 *             anchor[x,y] in pixels
 *             size[x,y]
 *             rotation in radian
 *             rotateWithView - if true - add global rotation
 *             fixX,fixY - set this coordinate to a fix css pixel, ignore pos
 *             background: a color for an optional background rectangle
 *             backgroundAlpha: an alpha for the background
 *             backgroundCircle: a color for an optional background circle
 * @return {ol.Coordinate} the css pixel coordinates of the object
 */
avnav.map.Drawing.prototype.drawImageToContext=function(point,image,opt_options){
    if (! this.context) return;
    if (image.naturalHeight == 0 || image.naturalWidth == 0) return; //silently ignore error
    var rt=this.pointToCssPixel(point);
    var xy=this.pixelToDevice(rt);
    if (opt_options && opt_options.fixX !== undefined) {
        xy[0]=opt_options.fixX*this.devPixelRatio;
    }
    if (opt_options &&  opt_options.fixY !== undefined) {
        xy[1]=opt_options.fixY*this.devPixelRatio;
    }
    var devpixratio=this.devPixelRatio;
    var anchor=[0,0];
    if (opt_options && opt_options.anchor){
        anchor[0]+=opt_options.anchor[0]*devpixratio;
        anchor[1]+=opt_options.anchor[1]*devpixratio;
    }
    var size;
    if (opt_options && opt_options.size) {
        size=opt_options.size;
    }
    else {
        size=[image.naturalWidth,image.naturalHeight];
    }
    if (size[0]<=0 || size[1] <= 0) return;
    /** @type {CanvasRenderingContext2D} */
    var context=this.context;
    context.save();
    context.translate(xy[0],xy[1]);
    var angle=0;
    if (opt_options && opt_options.rotation) {
        angle = opt_options.rotation;
    }
    if (opt_options.rotateWithView) angle+=this.rotation;
    if (angle) context.rotate(angle);
    if (opt_options && (opt_options.background || opt_options.backgroundCircle)){
        context.beginPath();
        if (opt_options.background) {
            context.fillStyle = opt_options.background;
            context.rect(-anchor[0], -anchor[1], size[0] * devpixratio, size[1] * devpixratio);
        }
        else {
            context.fillStyle = opt_options.backgroundCircle;
            context.arc(0, 0,Math.max(size[0] * devpixratio, size[1] * devpixratio)/2,0,2*Math.PI);
        }
        var alpha=context.globalAlpha;
        if (opt_options.backgroundAlpha){
            context.globalAlpha=opt_options.backgroundAlpha;
        }
        context.fill();
        context.globalAlpha=alpha;
    }
    context.drawImage(image,-anchor[0],-anchor[1], size[0]*devpixratio, size[1]*devpixratio);
    context.restore();
    return rt;
};
/**
 * draw a dashed line
 * coordinates have to be in device coordinates
 * @private
 * @param x1 start x
 * @param y1 start y
 * @param x2 end x
 * @param y2 end y
 * @param dashLen the len in device pixel
 */
avnav.map.Drawing.prototype.dashedLine = function (x1, y1, x2, y2, dashLen) {
    this.context.moveTo(x1, y1);
    var dX = x2 - x1;
    var dY = y2 - y1;
    var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
    var dashX = dX / dashes;
    var dashY = dY / dashes;

    var q = 0;
    while (q++ < dashes) {
        x1 += dashX;
        y1 += dashY;
        this.context[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
    }
    this.context[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);
};
/**
 * draw an arrow with the current line style settings
 * x1,y1 being the peak (end of this line), x2,y2 the start, width - with at bottom
 * @private
 * @param x1
 * @param y1
 * @param x2
 * @param y2
 * @param w
 * @param pe: pixel from line end for peak
 * @param open: if true - open arrow
 */
avnav.map.Drawing.prototype.arrow=function(x1,y1,x2,y2,w,l,pe,open){
    var dx=x2-x1;
    var dy=y2-y1;
    if (Math.abs(dx)<0.0001) return;
    var a=Math.atan(dy/dx);
    var d=dx*dx+dy*dy;
    //compute part of line we must move
    var f=Math.sqrt(l*l/d);
    if (f> 0.8) f=0.8;
    var lf=Math.sqrt(pe*pe/d);
    if (lf > 0.5) lf=0.5;
    var x0=x1+lf*dx;
    var y0=y1+lf*dy;
    this.context.moveTo(x0,y0);
    dx=dx*f;
    dy=dy*f;
    x2=x0+dx;
    y2=y0+dy;
    //x2,y2 is now the feet for the arrow
    var ca=Math.cos(a);
    var sa=Math.sin(a);
    this.context.lineTo(x2-sa*w,y2+ca*w);
    if (open) this.context.moveTo(x2+sa*w,y2-ca*w);
    else this.context.lineTo(x2+sa*w,y2-ca*w);
    this.context.lineTo(x0,y0);
    this.context.moveTo(x1,y1);
};
/**
 * draw a line string
 * @param {Array.<ol.Coordinate>}points in map coordinates
 * @param opt_style - properties:
 *          color:  - css color
 *          width:  - width in px
 *          cap:    - line cap
 *          join:   - line join
 *          dashed: - if set draw a dashed line
 * @return {Array.<ol.Coordinate>} the css pixel coordinates of the points
 */
avnav.map.Drawing.prototype.drawLineToContext=function(points,opt_style){
    if (! points || points.length < 2) return;
    if (! this.context) return;
    var rt=[];
    this.setLineStyles(opt_style);
    this.context.beginPath();
    var p=this.pointToCssPixel(points[0]);
    rt.push(p);
    p=this.pixelToDevice(p);
    this.context.moveTo(p[0],p[1]);
    var i;
    var dashlen=0;
    if (opt_style && opt_style.dashed){
        dashlen=this.context.canvas.width/100;
        dashlen*=this.devPixelRatio;
    }
    var last=p;
    var nminus1=undefined;
    var arrowStyle;
    if (opt_style && opt_style.arrow){
       if (typeof opt_style.arrow === "object"){
           try{
               arrowStyle={}
               arrowStyle.width=opt_style.arrow.width||(this.context.lineWidth||1)*3;
               arrowStyle.length=opt_style.arrow.length||(this.context.lineWidth||1)*8;
               arrowStyle.offset=opt_style.arrow.offset||10;
               arrowStyle.open=opt_style.arrow.open||false;
           } catch (e){;}
       } else{
           arrowStyle={}
           arrowStyle.width=(this.context.lineWidth||1)*3;
           arrowStyle.length=(this.context.lineWidth||1)*8;
           arrowStyle.offset=10;
           arrowStyle.open=false;
       }
    }
    for (i=1;i<points.length;i++){
        p=this.pointToCssPixel(points[i]);
        rt.push(p);
        p=this.pixelToDevice(p);
        if (dashlen == 0) this.context.lineTo(p[0],p[1]);
        else this.dashedLine(last[0],last[1],p[0],p[1],dashlen);
        nminus1=last;
        last=p;
        if (arrowStyle){
            this.arrow(last[0],last[1],nminus1[0],nminus1[1],arrowStyle.width,arrowStyle.length,arrowStyle.offset,arrowStyle.open);
        }
    }

    this.context.stroke();
    return rt;
};
/**
 * draw a round bubble
 * @param point - the center
 * @param radius - radius in css pixel
 * @param opt_style - see draw line, additionally background for a fill color
 */
avnav.map.Drawing.prototype.drawBubbleToContext=function(point,radius,opt_style){
    if (! this.context) return;
    var rt=[];
    this.setLineStyles(opt_style);
    var cp=this.pointToCssPixel(point);
    rt=cp;
    cp=this.pixelToDevice(cp);
    var r=radius*this.devPixelRatio;
    this.context.beginPath();
    this.context.arc(cp[0],cp[1],r,0, 2 * Math.PI);
    this.context.stroke();
    if (opt_style && opt_style.background){
        this.context.fillStyle=opt_style.background;
        this.context.fill();
    }
    return rt;
};


/**
 *
 * @param {ol.Coordinate} point
 * @param {string} text
 * @param opt_styles - properties
 *      font: the text font
 *      color: the text color
 *      stroke: text stroke - either stroke or color (color will win)
 *      width: text width
 *      align: text align
 *      baseline: text baseline
 *      rotateWithView: if true show rotated (default: false)
 *      offsetX
 *      offsetY
 *      fixX: use this as x position (ignore point[0])
 *      fixY: use this as y position (ignore point[1])
 */
avnav.map.Drawing.prototype.drawTextToContext=function(point,text,opt_styles){
    if (!this.context) return;
    if (! point) return;
    var doFill=true;
    var doStroke=false;
    var noRotate=true;
    var rt=this.pointToCssPixel(point);
    var dp=this.pixelToDevice(rt);
    var offset=[0,0];
    if (opt_styles) {
        if (opt_styles.font) this.context.font = opt_styles.font;
        if (opt_styles.color) this.context.fillStyle = opt_styles.color;
        if (opt_styles.stroke) {
            doStroke = true;
            this.context.strokeStyle = opt_styles.stroke;
        }
        if (opt_styles.width)this.context.lineWidth = opt_styles.width;
        if (opt_styles.rotateWithView) noRotate=false;
        if (opt_styles.fixX !== undefined) {
            dp[0]=opt_styles.fixX*this.devPixelRatio;
        }
        if (opt_styles.fixY !== undefined) {
            dp[1]=opt_styles.fixY*this.devPixelRatio;
        }
        if (opt_styles.offsetX) offset[0]=opt_styles.offsetX;
        if (opt_styles.offsetY) offset[1]=opt_styles.offsetY;
    }
    offset=this.pixelToDevice(offset);
    this.context.textAlign = opt_styles.align || 'center';
    this.context.textBaseline = opt_styles.baseline || 'middle';
    if (this.rotation && noRotate){
        this.context.save();
        this.context.translate(dp[0],dp[1]);
        this.context.rotate(0);
        if (doStroke) this.context.strokeText(text,offset[0],offset[1]);
        if (doFill) this.context.fillText(text,offset[0],offset[1]);
        this.context.restore();
    }
    else {
        if (doStroke) this.context.strokeText(text,dp[0]+offset[0],dp[1]+offset[1]);
        if (doFill) this.context.fillText(text,dp[0]+offset[0],dp[1]+offset[1]);
    }
    return rt;
};


/**
 * get the drawing context
 * @returns {CanvasRenderingContext2D}
 */
avnav.map.Drawing.prototype.getContext=function(){
    return this.context;
};
/**
 * get the device-pixel ratio
 * @returns {number}
 */
avnav.map.Drawing.prototype.getDevPixelRatio=function(){
    return this.devPixelRatio;
};

/**
 * get the current view rotation
 * @returns {number}
 */
avnav.map.Drawing.prototype.getRotation=function(){
    return this.rotation;
};
/**
 * convert a point in map coordinates into pixel
 * @param {ol.Coordinate} coord
 *
 * @returns {ol.Coordinate}
 */
avnav.map.Drawing.prototype.pointToCssPixel=function(coord) {
    var rt = this.converter.coordToPixel(coord);
    return rt;
};

/**
 * convert pixel from css to device
 * @param {ol.Coordinate} pixel
 * @returns {ol.Coordinate}
 */
avnav.map.Drawing.prototype.pixelToDevice=function(pixel) {
    var rt=[];
    rt[0]=pixel[0]*this.devPixelRatio;
    rt[1]=pixel[1]*this.devPixelRatio;
    return rt;
};

/**
 * handle changed properties
 * @param evdata
 */
avnav.map.Drawing.prototype.propertyChange=function(evdata){
};
/**
 * set the current devPixelRatio
 * @param {number} ratio
 */
avnav.map.Drawing.prototype.setDevPixelRatio=function(ratio){
    this.devPixelRatio=ratio;
};

/**
 * set the context
 * @param {CanvasRenderingContext2D} context
 */
avnav.map.Drawing.prototype.setContext=function(context){
    this.context=context;
};
/**
 * set the rotation of the view
 * @param angle
 */
avnav.map.Drawing.prototype.setRotation=function(angle){
    this.rotation=angle;
};

avnav.map.Drawing.prototype.setLineStyles=function(opt_style){
    if (opt_style){
        if (opt_style.color) this.context.strokeStyle=opt_style.color;
        if (opt_style.width) this.context.lineWidth=opt_style.width;
        if (opt_style.cap) this.context.lineCap=opt_style.cap;
        if (opt_style.join) this.context.lineJoin=opt_style.join;
    }
};
