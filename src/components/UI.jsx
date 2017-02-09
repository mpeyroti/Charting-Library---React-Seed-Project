import configs from "../../configs/ui.js";
import TimeZone from "./TimezoneModal";
import ThemeModal from "./ThemeModal";
import StudyModal from "./StudyModal";
import { ChartStore, Actions } from "../stores/ChartStore";
var UI = React.createClass({
    getInitialState: function () {
        return {
            ciq: null
        }
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.ciq) {
            return this.setState({
                ciq: nextProps.ciq
            });
        }
    },
    render: function () {
        return (
            <ciq-UI-Wrapper>
                <nav className="ciq-nav">
                    <div className="left">
                        <ChartSymbol ciq={this.state.ciq} />
                        <Comparison ciq={this.state.ciq} />
                    </div>
                    <div className="right">
                        <Periodicity ciq={this.state.ciq} />
                        <ChartTypes ciq={this.state.ciq} />
                        <StudyUI ciq={this.state.ciq} />
                        <ThemeUI ciq={this.state.ciq} />
                        <Crosshairs ciq={this.state.ciq} />
                        <TimeZoneButton ciq={this.state.ciq} />
                    </div>
                </nav>
            </ciq-UI-Wrapper>
        )
    }
});

var StudyUI = React.createClass({
    getInitialState: function () {
        return {
            ciq: null
        }
    },
    componentWillMount() {

    },
    addStudy(study) {
        CIQ.Studies.addStudy(this.state.ciq, study);
    },
    getStudyList() {
        var studies = [];
        Object.keys(CIQ.Studies.studyLibrary).map(function (study, index) {
            studies.push(study);
        })
        return studies.sort();
    },
    openModal(params) {
        this.refs.studyModal.open(params);
    },
    componentWillReceiveProps(nextProps) {
        var self = this;
        if (nextProps.ciq) {
            function closure(fc) {
                return function () {
                    fc.apply(self, arguments);
                };
            }
            nextProps.ciq.callbacks.studyOverlayEdit = closure(self.openModal);
            nextProps.ciq.callbacks.studyPanelEdit = closure(self.openModal);
            this.setState({
                ciq: nextProps.ciq
            });
        }

    },
    render: function () {
        var self = this;
        var studies = this.getStudyList().map(function (study, index) {
            return <menu-option key={"study" + index} onClick={function () {
                self.addStudy(study);
            }}><span>{study}</span></menu-option>

        });
        return (
            <span>
                <StudyModal ref="studyModal" />
                <menu-select id="studySelect">
                    <span className="title">Studies</span>
                    <menu-select-options className="ps-container">
                        {studies}
                    </menu-select-options>
                </menu-select>
            </span>
        );
    }
});

var TimeZoneButton = React.createClass({
    getInitialState: function () {
        return {
            ciq: null
        }
    },
    onClick() {
        this.refs.modal.toggle();

    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.ciq) {
            return this.setState({
                ciq: nextProps.ciq
            });
        }
    },
    render: function () {
        var self = this;
        return (
            <span style={{
                display: "inline-block"
            }}><TimeZone ref="modal" ciq={this.state.ciq} /> <button className="timezone-btn" onClick={this.onClick}></button></span>
        )
    }
});

var ChartSymbol = React.createClass({
    getInitialState: function () {
        return {
            ciq: null,
            symbol: "AAPL"
        }
    },
    onOptionClick() {
        if (!this.state.ciq || !this.state.symbol) return;
        this.state.ciq.newChart(this.state.symbol);
        this.setState({
            symbol: null
        })
        this.refs["symbolInput"].value="";

    },
    onChange(event) {
        this.setState({
            symbol: event.target.value
        })

    },
	handleKeyPress(key){
		if(key == 'Enter'){
			this.onOptionClick();
		}
	},
    componentWillReceiveProps(nextProps) {
        if (nextProps.ciq) {
            return this.setState({
                ciq: nextProps.ciq
            });
        }
    },
    render: function () {
        var self = this;
        return (

            <span className="symbol-frame">
	            <input ref="symbolInput" id="symbolInput" type="text" placeholder="Enter Symbol"
	            onChange={function (event) {
		            self.onChange(event.nativeEvent);
	            }}
	            onKeyPress={function(event){ self.handleKeyPress(event.key); }}></input><div className="symbol-btn" onClick={this.onOptionClick}></div>
            </span>


        )
    }
});

var Periodicity = React.createClass({
    getInitialState: function () {
        return {
            ciq: null,
            activeOption: null
        }
    },
    onOptionClick(period, interval, index) {
        if (!this.state.ciq) return;
        this.state.ciq.setPeriodicityV2(period, interval);
        this.setState({
            activeOption: configs.periodicity.options[index]
        })

    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.ciq) {
            return this.setState({
                ciq: nextProps.ciq,
                activeOption: this.getCurrentOption(nextProps.ciq.layout)
            });
        }
    },
    getCurrentOption(layout) {
        for (var i = 0; i < configs.periodicity.options.length; i++) {
            var option = configs.periodicity.options[i];
            if (layout.interval === option.interval && layout.period === option.periodicity) {
                return option;
            }
        }
    },
    render: function () {
        var self = this;

        var options = configs.periodicity.options.map(function (item, index) {
            return <menu-option key={"period" + index} className="option" onClick={function () {
                self.onOptionClick(item.period, item.interval, index);
            }}>{item.label}</menu-option>
        })

        return (
            <span>
                <menu-select id="periodicitySelect">
                    <span className="title">{this.state.activeOption ? this.state.activeOption.label : null}</span>
                    <menu-select-options className="menu-hover">
                        {options}
                    </menu-select-options>
                </menu-select>
            </span>
        )
    }
});

var ChartTypes = React.createClass({
    getInitialState: function () {
        return {
            ciq: null,
            activeOption: null
        };
    },
    onOptionClick(type, index) {
        if (!this.state.ciq) return;
        if ((type.aggregationEdit && this.state.ciq.layout.aggregationType != type.type) || type.type == 'heikinashi') {
            this.state.ciq.setChartType('candle');
            this.state.ciq.setAggregationType(type.type);
        } else {
            this.state.ciq.setChartType(type.type);
        }
        this.setState({
            activeOption: configs.chartTypes.types[index]
        });
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.ciq) {
            return this.setState({
                ciq: nextProps.ciq,
                activeOption: this.getCurrentOption(nextProps.ciq.layout)
            });
        }
    },
    getCurrentOption(layout) {
        for (var i = 0; i < configs.chartTypes.types.length; i++) {
            var option = configs.chartTypes.types[i];
            if (layout.chartType === option.type) {
                return option;
            }
        }
        return configs.chartTypes.types[0];
    },
    render: function () {
        var self = this;
        var options = configs.chartTypes.types.map(function (item, index) {
            return <menu-option key={"type" + index} className="option" onClick={function () {
                self.onOptionClick(item, index);
            }}>{item.label}</menu-option>
        });

        return (

            <menu-select id="chartTypeSelect">
                <span className="title">{this.state.activeOption ? this.state.activeOption.label : this.state.activeOption}</span>
                <menu-select-options className="menu-hover">
                    {options}
                </menu-select-options>
            </menu-select>


        )
    }
});
var Comparison = React.createClass({
    getInitialState: function () {
        return {
            ciq: null,
            symbol: null,
            chartSeries: []
        }
    },
    compareChange(event) {
        this.setState({
            symbol: event.target.value
        })
    },
    onOptionClick() {
        if (!this.state.ciq) return;
        function getRandomColor() {
            var letters = '0123456789ABCDEF';
            var color = '#';
            for (var i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        }
        var newSeries = this.state.ciq.addSeries(this.state.symbol, {
            isComparison: true,
            color: getRandomColor(),
            data: {
                useDefaultQuoteFeed: true
            }
        });
        this.setState({
            symbol: null
        });
        this.refs["compareInput"].value = "";
        Actions.addComparisonSeries(newSeries);
    },
	handleKeyPress(key){
		if(key == 'Enter'){
			this.onOptionClick();
		}
	},
    componentWillReceiveProps(nextProps) {
        if (nextProps.ciq) {
            return this.setState({
                ciq: nextProps.ciq
            });
        }
    },
    render: function () {
        var self = this;
        return (
            <span className="symbol-frame">
	            <input ref="compareInput" onChange={function (event) {
		            self.compareChange(event.nativeEvent);
	            }}
	            onKeyPress={function(event){ self.handleKeyPress(event.key); }} id="symbolCompareInput" placeholder="Add Comparison" type="text" >
                </input>
                <div className="comparison-btn" onClick={this.onOptionClick} ></div>
            </span>
        );
    }
});


var Crosshairs = React.createClass({
    getInitialState: function () {
        return {
            ciq: null
        }
    },
    onClick() {
        if (!this.state.ciq) return;
        this.state.ciq.layout.crosshair = !this.state.ciq.layout.crosshair;
        this.forceUpdate();

    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.ciq) {
            return this.setState({
                ciq: nextProps.ciq
            });
        }
    },
    render: function () {
        var cName = "crosshair-btn ";
        cName += this.state.ciq ? (this.state.ciq.layout.crosshair ? "active" : "") : "";
        return (
            <span> <button className={cName} onClick={this.onClick}></button></span>
        );
    }
});

var ThemeUI = React.createClass({
    getInitialState: function () {
        return {
            themeList: [{
                "name": "Default",
                "settings": // the default theme settings
                {
                    "chart": {
                        "Axis Text": { "color": "rgba(186,189,192,1)" },
                        "Background": { "color": "rgba(28,42,53,1)" },
                        "Grid Dividers": { "color": "rgba(153,153,153,1)" },
                        "Grid Lines": { "color": "rgba(32,48,60,1)" }
                    },
                    "chartTypes": {
                        "Candle/Bar": {
                            "down": { "border": "rgba(0,0,0,1)", "color": "rgba(184,44,12,1)", "wick": "rgba(0,0,0,1)" },
                            "up": { "border": "rgba(0,0,0,1)", "color": "rgba(140,193,118,1)", "wick": "rgba(0,0,0,1)" }
                        },
                        "Line": { "color": "rgba(0,0,0,1)" },
                        "Mountain": { "color": "rgba(102,202,196,0.498039)" }
                    }
                }
            }, {
                "name": "+ New Theme"
            }],
            themeHelper: null
        };
    },
    setThemeHelper(ciq) {
        if (!ciq) return;
        var themeHelper = new CIQ.ThemeHelper({
            'stx': ciq
        });
        this.setState({
            ciq: ciq,
            themeHelper: themeHelper,
        });
    },
    themeSelect(theme) {
        if (theme.name === "+ New Theme") {
            return this.openThemeModal();
        }
        this.updateTheme(theme.settings);
    },
    openThemeModal() {
        this.refs.themeModal.openDialog(this.addTheme);
    },
    addTheme(theme, themeName) {
        this.state.themeList.push({
            name: themeName,
            settings: theme
        })
        this.setState({
            themeList: this.state.themeList
        })
        this.updateTheme(theme);
    },
    updateTheme(theme) {
        var c = CIQ.clone(theme);
        this.state.themeHelper.settings = c;
        this.state.themeHelper.update();
    },
    componentWillReceiveProps(nextProps) {
        if (nextProps.ciq) {
            this.setThemeHelper(nextProps.ciq);
        }

    },
    render: function () {
        var self = this;
        var options = this.state.themeList.map(function (theme, index) {
            return (<menu-option key={"theme" + index} className="option" onClick={function () {
                self.themeSelect(theme)
            }} >{theme.name}</menu-option>);
        });
        return (
            <span>
                <ThemeModal ref="themeModal" themeHelper={this.state.themeHelper ? this.state.themeHelper : null} />
                <menu-select id="themeSelect">
                    <span className="title">Select Theme</span>
                    <menu-select-options>
                        {options}
                    </menu-select-options>
                </menu-select>
            </span>
        );
    }
});


module.exports = UI;