/**
 * Created by andreas on 23.02.16.
 */

var React=require("react");
var NavData=require('../nav/navdata');

var EditRouteWidget=React.createClass({
    propTypes:{
        //formatter: React.PropTypes.func,
        onClick: React.PropTypes.func,
        store: React.PropTypes.object.isRequired,
        classes: React.PropTypes.string,
        wide:   React.PropTypes.bool //display info side by side
    },
    _getValues:function(){
        var approaching=this.props.store.getRoutingHandler().getApproaching();
        return{
            name:this.props.store.getValue('edRouteName'),
            remain:this.props.store.getValue('edRouteRemain'),
            eta:this.props.store.getValue('edRouteEta'),
            numPoints:this.props.store.getValue('edRouteNumPoints'),
            len:this.props.store.getValue('edRouteLen'),
            isApproaching: approaching,
            editingActive: this.props.store.getRoutingHandler().isEditingActiveRoute(),
            hasRoute: this.props.store.getRoutingHandler().getRoute() !== undefined
        };
    },
    getInitialState: function(){
        return this._getValues();
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState(this._getValues());
    },
    componentDidUpdate: function(){
        if (this.props.layoutUpdate){
            this.props.layoutUpdate();
        }
    },
    render: function(){
        var self=this;
        var classes="avn_widget avn_editingRouteWidget "+this.props.classes||"";
        if (this.state.editingActive) classes +=" avn_activeRoute ";
        else classes+=" avn_otherRoute";
        if (! this.state.hasRoute){
            return (
                <div className={classes} onClick={this.props.onClick}>
                    <div className="avn_widgetInfoLeft">RTE</div>
                    <div id="avi_route_info_name">No Route</div>
                </div>
            )
        }
        var rname;
        if (this.props.wide){
            rname=this.state.name;
        }
        else {
            rname = this.state.name.substr(0, 14);
            if (this.state.name.length > 14) rname += "..";
        }
        return (
        <div className={classes} onClick={this.props.onClick} style={this.props.style}>
            <div className="avn_widgetInfoLeft">RTE</div>
            <div className="avn_routeName">{rname}</div>
            <div className="avn_routeInfoLine">
                <span className="avn_route_label">PTS:</span>
                <span className="avn_routeInfo">{this.state.numPoints}</span>
            </div>
            <div className="avn_routeInfoLine">
                <span className="avn_route_label">DST:</span>
                <span className="avn_routeInfo">{this.state.len}</span>
            </div>
            <div className="avn_routeInfoLine">
                <span className="avn_route_label">RTG:</span>
                <span className="avn_routeInfo">{this.state.remain}</span>
            </div>
            <div className="avn_routeInfoLine">
                <span className="avn_route_label">ETA:</span>
                <span className="avn_routeInfo avd_edRouteEta">{this.state.eta}</span>
            </div>
        </div>
        );
    }

});

module.exports=EditRouteWidget;