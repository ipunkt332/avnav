/**
 * Created by Andreas on 27.04.2014.
 */
avnav.provide('avnav.gui.Gpspage');



/**
 *
 * @constructor
 */
avnav.gui.Gpspage=function(){
    avnav.gui.Page.call(this,'gpspage');
    /**
     * if set - return to this page on cancel
     * @type {string}
     */
    this.returnpage=undefined;
    /**
     * @private
     * @type {avnav.util.Formatter}
     */
    this.formatter=new avnav.util.Formatter();

};
avnav.inherits(avnav.gui.Gpspage,avnav.gui.Page);



avnav.gui.Gpspage.prototype.showPage=function(options){
    if (!this.gui) return;
    if (options && options.returnpage){
        this.returnpage=options.returnpage;
    }
    else {
        this.returnpage=undefined;
    }
    this.computeLayout();
};
avnav.gui.Gpspage.prototype.localInit=function(){
    var self=this;
    $(window).on('resize',function(){
       self.computeLayout();
    });
    $('#avi_gps_page_inner').on('click',function(){
       self.gui.showPage(self.returnpage?self.returnpage:'mainpage');
    });
    $(document).on(avnav.nav.NavEvent.EVENT_TYPE, function(ev,evdata){
        self.navEvent(evdata);
    });
};


avnav.gui.Gpspage.prototype.hidePage=function(){

};

/**
 * compute the layout for the page
 * we assum n columns of class avn_gpsp_vfield
 * within each solumn we have n boxes of class avn_gpsp_hfield each having
 *   an attr avnfs given the height weight of this field
 * within eacho of such boxes we assume n avn_gpsp_value floating left each
 * having an attr avnrel given a relative with (nearly character units)
 * @private
 */
avnav.gui.Gpspage.prototype.computeLayout=function(){
    var numhfields=0;
    this.getDiv().find('.avn_gpsp_hfield').each(function(i,el){
        numhfields++;
    });
    if (numhfields == 0) return;
    var hfieldw=100/numhfields;
    this.getDiv().find('.avn_gpsp_hfield').each(function(i,el){
        $(el).css('width',hfieldw+"%");
        var vwidth=$(el).width();
        var vheight=$(el).height();
        var numhfields=0;
        var weigthsum=0;
        var vfieldweights=[];
        var vfieldlengths=[];
        $(el).find('.avn_gpsp_vfield').each(function(idx,hel){
            numhfields++;
            vfieldweights[idx]=parseFloat($(hel).attr('avnfs'));
            weigthsum+=vfieldweights[idx];
            var len=0;
            $(hel).find('.avn_gpsp_value').each(function(vidx,vel){
                len+=parseFloat($(vel).attr('avnrel'));
            });
            vfieldlengths[idx]=len;
        });
        $(el).find('.avn_gpsp_vfield').each(function(idx,hel){
            var relheight=vfieldweights[idx]/weigthsum*100;
            $(hel).css('height',relheight+"%");
            var fontbase=relheight*vheight*0.7/100;
            var labelbase=fontbase;
            if ((fontbase * vfieldlengths[idx]) > vwidth ){
                fontbase = vwidth/(vfieldlengths[idx]);
            }
            $(hel).find('.avn_gpsp_value').each(function(vidx,vel){
                $(vel).css('font-size',fontbase+"px");
            });
            $(hel).find('.avn_gpsp_unit').each(function(vidx,vel){
                $(vel).css('font-size',fontbase*0.3+"px");
            });
            $(hel).find('.avn_gpsp_field_label').each(function(vidx,vel){
                $(vel).css('font-size',labelbase*0.2+"px");
            });
        });

    });
    var xh=$('#avi_gpsp_xte_field').height()-$('#avi_gpsp_xte_label').height();
    try {
        var canvas=document.getElementById('avi_gpsp_xte');
        canvas.height = xh;
        canvas.style.height=xh+"px";
        canvas.width=$('#avi_gpsp_xte').width();
    }catch(e){}

};

/**
 *
 * @param {CanvasRenderingContext2D} context
 */
avnav.gui.Gpspage.prototype.drawXte=function(context){
    if (! this.isVisible()) return;
    var xteMax=this.gui.properties.getProperties().gpsXteMax;
    var xteText=this.formatter.formatDecimal(xteMax,1,1)+"nm";
    var color=$('#avi_gpsp_xte').css('color');
    context.fillStyle =color;
    context.strokeStyle=color;
    var w=context.canvas.width;
    var h=context.canvas.height;
    context.clearRect(0,0,w,h);
    var textBase=h*0.9;
    var textSize=h*0.2;
    var left=w*0.1;
    var right=w*0.9;
    var linebase=h*0.4;
    var sideHeight=h*0.3;
    var middleHeight=h*0.6;
    var shipUpper=h*0.45;
    var shipH=h*0.3;
    var shipw=w*0.03;
    var mText="0";
    context.font="normal "+Math.ceil(textSize)+"px Arial";
    context.textAlign="center";
    context.fillText(xteText,left,textBase);
    context.fillText(xteText,right,textBase);
    context.fillText("0",0.5*w,textBase);
    context.lineWidth=2;
    context.beginPath();
    context.moveTo(left,linebase-0.5*sideHeight);
    context.lineTo(left,linebase+0.5*sideHeight);
    context.moveTo(left,linebase);
    context.lineTo(right,linebase);
    context.moveTo(right,linebase-0.5*sideHeight);
    context.lineTo(right,linebase+0.5*sideHeight);
    context.moveTo(0.5*w,linebase-0.5*middleHeight);
    context.lineTo(0.5*w,linebase+0.5*middleHeight);
    context.stroke();
    context.closePath();
    var curXte=this.navobject.getRawData(avnav.nav.NavEventType.NAV).routeXte;
    if (curXte === undefined) return;
    var xtepos=curXte/xteMax;
    if (xtepos < -1.1) xtepos=-1.1;
    if (xtepos > 1.1) xtepos=1.1;
    xtepos=xtepos*(right-left)/2+left+(right-left)/2;
    context.beginPath();
    context.moveTo(xtepos,shipUpper);
    context.lineTo(xtepos-shipw,shipUpper+shipH);
    context.lineTo(xtepos+shipw,shipUpper+shipH);
    context.lineTo(xtepos,shipUpper);
    context.fill();
    context.closePath();
};

avnav.gui.Gpspage.prototype.navEvent=function(evt){
    var canvas=$('#avi_gpsp_xte')[0];
    this.drawXte(canvas.getContext("2d"));
};
//-------------------------- Buttons ----------------------------------------
/**
 * cancel gps page (go back to main)
 * @private
 */
avnav.gui.Gpspage.prototype.btnGpsCancel=function(button,ev){
    log("GpsCancel clicked");
    this.gui.showPage(this.returnpage?this.returnpage:'mainpage');
};

(function(){
    //create an instance of the status page handler
    var page=new avnav.gui.Gpspage();
}());

