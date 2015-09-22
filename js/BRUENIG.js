function msToISO (mstime) {
    if (isNaN(mstime)) {
        throw "NaN";
    } else {
        return toLocalISO(new Date(mstime));
    }
}

function toLocalISO(datetime) { 
    var tzo = -datetime.getTimezoneOffset();
    var dif = tzo >= 0 ? '+' : '-';
    var pad = function(num) {
            var norm = Math.abs(Math.floor(num));
            return (norm < 10 ? '0' : '') + norm;
        };
    return datetime.getFullYear() 
        + '-' + pad(datetime.getMonth()+1)
        + '-' + pad(datetime.getDate())
        + 'T' + pad(datetime.getHours())
        + ':' + pad(datetime.getMinutes()) 
        + ':' + pad(datetime.getSeconds()) 
        + '.' + pad(datetime.getMilliseconds()) 
        + dif + pad(tzo / 60) 
        + ':' + pad(tzo % 60);
}

function extend(base, sub) {
  var origProto = sub.prototype;
  sub.prototype = Object.create(base.prototype);
  for (var key in origProto)  {
     sub.prototype[key] = origProto[key];
  }
  sub.prototype.constructor = sub;
  Object.defineProperty(sub.prototype, 'constructor', { 
    enumerable: false, 
    value: sub 
  });
};

function construct(constructor, args) {
    function F() {
        return constructor.apply(this, args);
    }
    F.prototype = constructor.prototype;
    return new F();
};

function AreaResizer() {
	this.addResizeListener(this.resized);
	
	this.offsetList = []
}

AreaResizer.prototype = {
	resizeOffset : function (callback, thisArg, direction, offset, min) {
		this.offsetList.push([callback, thisArg, direction, offset, min])
	},
	resized : function (event, dimensions) {
		for (var i = 0; i < this.offsetList.length ;i++) {
			if (this.offsetList[i][3][0]  === 'abs') {
				var calcDir = (this.offsetList[i][2] === 'top') ? 'height' : 'width';
				var calcOffset = dimensions[calcDir] + this.offsetList[i][3][1];
				calcOffset = (calcOffset > this.offsetList[i][4]) ? calcOffset : this.offsetList[i][4];
				var offsetArg = {};
				offsetArg[this.offsetList[i][2]] = calcOffset;
				this.offsetList[i][0].apply(this.offsetList[i][1],[ offsetArg ]);
			} else if (this.offsetList[i][3][0]  === 'mid') {
				var calcDir = (this.offsetList[i][2] === 'top') ? 'height' : 'width';
				var calcOffset = (dimensions[calcDir]/2) + this.offsetList[i][3][1];
				calcOffset = (calcOffset > this.offsetList[i][4]) ? calcOffset : this.offsetList[i][4];
				var offsetArg = {};
				offsetArg[this.offsetList[i][2]] = calcOffset;
				this.offsetList[i][0].apply(this.offsetList[i][1],[ offsetArg ]);	
			}
		}
	},
	addResizeListener: function(action) {
		var callee = this;
		$( window ).resize(function(event) {
			action.apply(callee,[event, {'width': $( window ).width(), 'height': $( window ).height()}]);
		});
	},
	trigger : function () {
		this.resized('',{'width': $( window ).width(), 'height': $( window ).height()})
	}
}

// LineBreak function
function LineBreak() {
	this.jElement = $('<br>');
}

LineBreak.prototype = {
    getJElement : function () {
        return this.jElement;
    },
    setVisibility : function (visibility) {
		if (visibility) {
			this.getJElement().show();
		} else {
			this.getJElement().hide();
		}
	},
};

// Area Classes
function Area(parent, id, name, description) {
	this.parent = parent;
	this.id = id;
	this.name = name;
	this.description = description;
	this.jElement = $('<div class="area"></div>').appendTo(this.parent.getJElement());
};

Area.prototype = {
	getParent: function() {
		return this.parent();
	},
	getId: function() {
		return this.id;
	},
	getName: function() {
		return this.name;
	},
	getDescription: function() {
		return this.description;
	},
	getJElement: function(){
		return this.jElement;
	},
	addClickListener: function(area, action){
		var callee = this;
		$( area ).click( function (event) {
			event.stopPropagation();
			if (action) {
				action.apply(callee, [event] );
			};
		});
	},
	addHoverListener: function(area, actionIn, actionOut){
		var callee = this;
		$( area ).mouseenter( function (event) {
			event.stopPropagation();
			if (actionIn) {
				actionIn.apply(callee, [event] );
			};
		});
		$( area ).mouseleave( function (event) {
			event.stopPropagation();
			if (actionOut) {
				actionOut.apply(callee, [event] );
			};
		});
	},
	setWidth : function(value)
	{
		this.getJElement().width(value)
	},
	setHeight : function(value)
	{
		this.getJElement().height(value)
	},
	setVisibility : function (visibility) {
		if (visibility) {
			this.getJElement().show();
		} else {
			this.getJElement().hide();
		}
	}, 
	remove : function () {
		this.getJElement().remove();
	}
};

function BodyArea(id) {
	this.parentJElement = null;
	this.parent = null;
	this.id = id;
	this.name = 'Body';
	this.description = 'Body';
	this.jElement = $('body');
}

BodyArea.prototype = {

};

function PlacementArea(parent, id, name, description) {
	Area.call(this, parent, id, name, description);
	this.jElement.addClass('placement');
};

PlacementArea.prototype = {
	setWidth: function(value) {
		this.getJElement().width(value);
	},
	setHeight: function(value) {
		this.getJElement().height(value);
	},
	setOffset: function(valueDict) {
		this.getJElement().offset(valueDict);
	}
};

function BlockArea(parent, id, name, description) {
	Area.call(this, parent, id, name, description);
	this.jElement.addClass('block');
	this.widgetList = [];
};

BlockArea.prototype = {
	addWidget : function(args)
	{
		defaultArgs = [this, uniId++, arguments[0].type, 'ToDo']
		var widget = construct(arguments[0],defaultArgs.concat(arguments[1]));
		this.widgetList.push(widget);
		return widget;
	},
	addNewLine : function() {
        var newLine = new LineBreak();
		newLine.getJElement().appendTo(this.jElement);
        return newLine;
	}
};

function WidgetArea(parent, id, name, description) {
	Area.call(this, parent, id, name, description);
	this.jElement.addClass('widget');
};

WidgetArea.prototype = {
};

function ContainerArea(parent, id, name, description) {
	Area.call(this, parent, id, name, description);
	this.jElement.addClass('container');
	this.widgetList = [];
};

ContainerArea.prototype = {
	addWidget : function(args)
	{
		defaultArgs = [this, uniId++, arguments[0].type, 'ToDo']
		var widget = construct(arguments[0],defaultArgs.concat(arguments[1]));
		this.widgetList.push(widget);
		return widget;
	},
	addNewLine : function() {
        var newLine = new LineBreak();
		newLine.getJElement().appendTo(this.jElement);
        return newLine;
	}
};

function Input(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'Input'
	this.label = new _Label(this, this.id, this.name, this.description)
	$('<br>').appendTo(this.jElement)
	this.jInput = $('<input>').prop(
		{
			type: 'Text'
		}
	).appendTo(this.jElement)
}

Input.prototype = {
    setWidth : function (value) {
		this.getJElement().width(value);
        this.label.setWidth(value);
		var valueLength = value.length-2;
		var valueInt = value.substr(0,valueLength);
		this.jInput.width(sprintf('%spx',parseInt(valueInt)-12));
	},
	setValue : function(value) {
		this.jInput.val(value);
	},
	getValue : function() {
		return this.jInput.val();
	},
	setDisabled : function(value) {
		this.jInput.prop('disabled',value);
	},
	getDisabled : function() {
		this.jInput.prop('disabled');
	},
	setTitle : function(args) {
		this.label.setText.apply(this.label,arguments);
	},
	getTitle : function(args) {
		this.label.getText.apply(this.label,arguments);
	}
}

function CheckBox(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'CheckBox'
	this.label = new _Label(this, this.id, this.name, this.description)
	$('<br>').appendTo(this.jElement)
	this.jInput = $('<input type=\'checkbox\'>').appendTo(this.jElement)
}

CheckBox.prototype = {
	setValue : function(value) {
		this.jInput.prop('checked', value);;
	},
	getValue : function() {
		return this.jInput.prop('checked');
	},
	setDisabled : function(value) {
		this.jInput.prop('disabled',value);
	},
	getDisabled : function() {
		this.jInput.prop('disabled');
	},
	setTitle : function(args) {
		this.label.setText.apply(this.label,arguments)
	},
	getTitle : function(args) {
		this.label.getText.apply(this.label,arguments)
	}
}

function Select(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'Select'
	this.length = 0
	this.label = new _Label(this, this.id, this.name, this.description)
	$('<br>').appendTo(this.jElement)
	this.jInput = $('<select></select>').appendTo(this.jElement)
}

Select.prototype = {
	addOptions : function(optionList) {
		var arrayLength = optionList.length;
		for (var i = 0; i < arrayLength; i++) {
			this.length++;
			this.jInput.append($('<option>', {
				value: optionList[i],
				text: optionList[i]
			}));
		}
	},
    empty : function (args) {
      this.jInput.empty(arguments);  
    },
	setValue : function(value) {
		this.jInput.val(value);;
	},
	getValue : function() {
		return this.jInput.val();
	},
	setDisabled : function(value) {
		this.jInput.prop('disabled',value);
	},
	getDisabled : function() {
		this.jInput.prop('disabled');
	},
	setTitle : function(args) {
		this.label.setText.apply(this.label,arguments)
	},
	getTitle : function(args) {
		this.label.getText.apply(this.label,arguments)
	}
}

function _Label(parent, id, name, description) {
	WidgetArea.call(this, parent, id, name, description);
	this.type = '_Label'
	this.jElement.addClass('label');
	this.setWidth('200px');
	this.setHeight('18px');
}

_Label.prototype = {
	setText : function(value) {
		this.text = value;
		this.getJElement().text(value);
	},
	getText : function() {
		return this.text;
	}
}

function Label(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'Label'
	this.label = new _Label(this, this.id, this.name, this.description)
}

Label.prototype = {
	setText : function(args) {
		this.label.setText.apply(this.label,arguments)
	},
	getText : function(args) {
		this.label.getText.apply(this.label,arguments)
	},
	setWidth : function (value) {
		this.getJElement().width(value);
		this.label.setWidth(value);
	}
}

function _Title(parent, id, name, description) {
	WidgetArea.call(this, parent, id, name, description);
	this.type = '_Label'
	this.jElement.addClass('label');
	this.jTitle = $('<h1></h1>').appendTo(this.jElement);
}

_Title.prototype = {
	setLvl : function(value) {
		if ( $.inArray(value, ['h1','h2','h3','h4','h5']) > -1 ) {
			this.lvl = value;
			this.jTitle.detach()
			this.jTitle = $(sprintf('<%s></%s>', value, value)).appendTo(this.jElement);
			this.jTitle.text(this.text)
		} else {
			throw 'Illegal Title Level'
		};
	},
	getLvl : function() {
		return this.lvl;
	},
	setText : function(value) {
		this.text = value;
		this.jTitle.text(value);
	},
	getText : function() {
		return this.text;
	}
}

function Title(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'Label'
	this.title = new _Title(this, this.id, this.name, this.description)
}

Title.prototype = {
	setLvl : function(args) {
		this.title.setLvl.apply(this.title,arguments)
	},
	getLvl : function(args) {
		this.title.getLvl.apply(this.title,arguments)
	},
	setText : function(args) {
		this.title.setText.apply(this.title,arguments)
	},
	getText : function(args) {
		this.title.getText.apply(this.title,arguments)
	}
}

function Image(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'Image'
	this.image = new _Image(this, this.id, this.name, this.description)
}

Image.prototype = {
	setSrc : function(args) {
		this.image.setSrc.apply(this.image,arguments)
	},
	setWidth : function(args) {
		this.image.setWidth.apply(this.image,arguments)
	}
}

function _Image(parent, id, name, description) {
	WidgetArea.call(this, parent, id, name, description);
	this.type = '_Image'
	this.jElement.addClass('image');
	this.jImage = $('<img src="">').appendTo(this.getJElement());
	this.jImage.addClass('imageDisp');
}

_Image.prototype = {
	setSrc : function(value) {
		this.jImage.attr({'src':value});
	}
}

function _StatusIndicator(parent, id, name, description) {
	WidgetArea.call(this, parent, id, name, description);
	this.type = 'StatusIndicator'
	this.jElement.addClass('statusIndicator');
	this.setWidth('18px');
	this.setHeight('18px');
	this.jElement.css('background-color', 'red');
}

_StatusIndicator.prototype = {
	error : function() {
		this.getJElement().css('background-color', 'red');
	},
	ok : function() {
		this.getJElement().css('background-color', 'green');
	},
	warning : function() {
		this.getJElement().css('background-color', 'yellow');
	},
	grey : function() {
		this.getJElement().css('background-color', 'grey');
	}
};

function Indicator(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'Indicator'
	this.jElement.addClass('indicator');
	this.statusIndicator = new _StatusIndicator(this, this.id, this.name, this.description);
	this.label = new _Label(this, this.id, this.name, this.description)
}

Indicator.prototype = {
	error : function(args) {
		this.statusIndicator.error.apply(this.statusIndicator,arguments)
	},
	ok : function(args) {
		this.statusIndicator.ok.apply(this.statusIndicator,arguments)
	},
	warning : function(args) {
		this.statusIndicator.warning.apply(this.statusIndicator,arguments)
	},
	grey : function(args) {
		this.statusIndicator.grey.apply(this.statusIndicator,arguments)
	},
	setText : function(args) {
		this.label.setText.apply(this.label,arguments)
	},
	setWidth : function (value) {
		this.getJElement().width(value);
		var valueLength = value.length-2;
		var valueInt = value.substr(0,valueLength);
		this.label.setWidth(sprintf('%spx',parseInt(valueInt)-20));
	}
};

function Form(parent, id, name, description, callee) {
	Area.call(this, parent, id, name, description);
	this.jForm = $('<Form/>').appendTo(this.jElement);
	this.widgetList = [];
	this.submitListeners = [];
	this.addSubmitListener(this.submitted);
};

Form.prototype = {
	submit : function(action, thisArg) {
		this.submitListeners.push([action, thisArg])
	},
        clearSubmit : function () {
		this.submitListeners = [];
        },
        getSubmit : function () {
		return this.submitListeners;
        },
	submitted : function(event){
		if (!this.disabled) {
			for (var i = 0 ; i < this.submitListeners.length ; i++) {
				this.submitListeners[i][0].apply(this.submitListeners[i][1], [event]);
			}
		}
	},
	addSubmitListener: function(action){
		var callee = this;
		this.jForm.submit( function (event) {
			event.preventDefault();
			if (action) {
				action.apply(callee, [event]);
			};
			return false;
		});
	},
    setSubmitListeners : function (list) {
            this.submitListeners = list;
    },
	addWidget : function(args)
	{
		defaultArgs = [this, uniId++, arguments[0].type, 'ToDo']
		var widget = construct(arguments[0],defaultArgs.concat(arguments[1]));
		this.widgetList.push(widget);
		return widget;
	},
	addNewLine : function() {
        var newLine = new LineBreak();
		newLine.getJElement().appendTo(this.jForm);
        return newLine;
	},
	getJElement : function() {
		return this.jForm;
	}
};

function _Button(parent, id, name, description) {
	WidgetArea.call(this, parent, id, name, description);
	this.type = '_Button'
	this.jElement.addClass('label'); ////////////////////////////////TODO
	this.jButton = $('<input/>').prop(
		{
			type : 'button'
		}
	).appendTo(this.jElement);
	
	this.jButton.css('cursor','pointer');
}

_Button.prototype = {
	setText : function(value) {
		this.text = value;
		this.jButton.val(value);
	},
	getText : function() {
		return this.val();
	},
	setType : function(value) {
		this.jButton.prop({type : value})
	},
	setDisabled : function(value) {
		if (value) {
			this.jButton.css('cursor','not-allowed');
		} else {
			this.jButton.css('cursor','pointer');
		}	
		this.jButton.prop('disabled',value);
	}
}

function Button(parent, id, name, description, text, imagePath) {
	ContainerArea.call(this, parent, id, name, description);
	this.jElement.addClass('button');
	if (typeof imagePath !== 'undefined'){
		this.image = $('<img class="buttonImage">').appendTo(this.jElement);
		this.image.attr("src", imagePath);
	}
	this.button = new _Button(this, uniId++, this.name, this.description)
	this.setText(text);
	this.clickListeners = [];
	this.addClickListener(this.jElement, this.clicked);
	this.disabled = false;
}

Button.prototype = {
	click : function (action, thisArg) {
		this.clickListeners.push([action, thisArg])
	},
	clicked: function(event){
		if (!this.disabled) {
			for (var i = 0 ; i < this.clickListeners.length ; i++) {
				this.clickListeners[i][0].apply(this.clickListeners[i][1], [event]);
			}
		}
	},	
	setText : function(args) {
		this.button.setText.apply(this.button,arguments)
	},
	getText : function(args) {
		this.button.getText.apply(this.button,arguments)
	},
	setType : function(args) {
		this.button.setType.apply(this.button,arguments)
	},
	setDisabled : function(value) {
		if (value) {
			this.disabled = value;
			this.button.setDisabled(true);
		} else {
			this.disabled = value;
			this.button.setDisabled(false);
		}
	}
};

function SubmitButton(parent, id, name, description, text, imagePath) {
	Button.call(this, parent, id, name, description, text, imagePath);
	this.setType('submit');
}

SubmitButton.prototype = {
};

function Progressbar(parent, id, name, description, callee, text) {
	Area.call(this, parent, id, name, description);
	this.jElement.addClass('progressbar-container');
	this.progressIndicator = $('<div class=\'progressbar-progress container\'></div>').appendTo(this.jElement);
}

Progressbar.prototype = {
	setProgress : function(progress) {
		// progress: 0...1
		this.progressIndicator.css('width',sprintf('%s%%', Math.round(progress*100)))
	}
};

function NavButton(parent, id, name, description, text, imagePath) {
	ContainerArea.call(this, parent, id, name, description);
	this.jElement.addClass('button');
	if (typeof imagePath !== 'undefined'){
		this.image = $('<img class="buttonImage">').appendTo(this.jElement);
		this.image.attr("src", imagePath);
	}
	this.label = new _Label(this, this.id, this.name, this.description);
	this.label.getJElement().addClass('nav-button');
	this.label.setWidth('110px');
	this.setText(text);
	this.clickListeners = [];
	this.addClickListener(this.jElement, this.clicked);
}

NavButton.prototype = {
	click : function (action, thisArg) {
		this.clickListeners.push([action, thisArg]);
	},
	clicked: function(event){
		if (!this.disabled) {
			for (var i = 0 ; i < this.clickListeners.length ; i++) {
				this.clickListeners[i][0].apply(this.clickListeners[i][1], [event]);
			}
		}
	},
	setText : function(args) {
		this.label.setText.apply(this.label,arguments);
	},
	getText : function(args) {
		this.label.getText.apply(this.label,arguments);
	}
};

// Overlay

function Overlay(parent, id, name, description, callee) {
	Area.call(this, parent, id, name, description);
	this.jElement.addClass('overlay-background');
	
}

Overlay.prototype = {
	click : function(event) {
		this.remove();
	},
	setClickClose : function(value) {
		if ( value ) {
			this.addClickListener(this.jElement, this.click);
		} else {
			this.removeClickListener(this.jElement);
		}
	}, 
	remove : function () {
		this.jElement.remove()
	}

}

function OverlayDisplay(parent, id, name, description, callee) {
	this.overlay = new Overlay(parent, id, name, description, callee);
	ContainerArea.call(this, this.overlay, id, name, description);
	this.jElement.addClass('overlay-display');
}

OverlayDisplay.prototype = {
	setClickClose : function(args) {
		this.overlay.setClickClose.apply(this.overlay,arguments)
	},
	remove : function(args) {
		this.overlay.remove.apply(this.overlay,arguments)
	},
	setOffset: function(valueDict) {
		this.getJElement().offset(valueDict);
	}
};

extend(Area, BodyArea);
extend(Area, BlockArea);
extend(Area, WidgetArea);
extend(Area, ContainerArea);
extend(Area, PlacementArea);
extend(Area, Progressbar);
extend(Area, Overlay);

extend(WidgetArea, _Button);
extend(WidgetArea, _Label);
extend(WidgetArea, _Title);
extend(WidgetArea, _Image);
extend(WidgetArea, _StatusIndicator);

extend(ContainerArea, Form);
extend(ContainerArea, Label);
extend(ContainerArea, CheckBox);
extend(ContainerArea, Title);
extend(ContainerArea, Image);
extend(ContainerArea, Input);
extend(ContainerArea, Select);
extend(ContainerArea, Indicator);
extend(ContainerArea, Button);
extend(Button, SubmitButton);
extend(ContainerArea, NavButton);
extend(ContainerArea, OverlayDisplay);



// Tabular Items
function Tabular(parent, id, name, description) {
	this.parent = parent;
	this.id = id;
	this.name = name;
	this.description = description;
	this.widgetList = [];
};

Tabular.prototype = {
	getParent: function() {
		return this.parent()
	},
	getId: function() {
		return this.id;
	},
	getName: function() {
		return this.name;
	},
	getDescription: function() {
		return this.description;
	},
	getJElement: function(){
		return this.jElement;
	},
	addClickListener: function(area, action){
		var callee = this;
		$( area ).click( function (event) {
			event.stopPropagation();
			if (action) {
				action.apply(callee, [event]);
			};
		});
	},
	removeClickListener: function (area) {
		$( area ).unbind( "click" );
	},
	addHoverListener: function(area, actionIn, actionOut){
		var callee = this;
		$( area ).mouseenter( function (event) {
			event.stopPropagation();
			if (actionIn) {
				actionIn.apply(callee, [event]);
			};
		});
		$( area ).mouseleave( function (event) {
			event.stopPropagation();
			if (actionOut) {
				actionOut.apply(callee, [event]);
			};
		});
	},
	setWidth : function(value)
	{
		this.getJElement().width(value)
	},
	setHeight : function(value)
	{
		this.getJElement().height(value)
	},
	setVisibility : function (visibility) {
		if (visibility) {
			this.getJElement().show();
		} else {
			this.getJElement().hide();
		}
	},	
	addWidget : function(args)
	{
		defaultArgs = [this, uniId++, arguments[0].type, 'ToDo']
		var widget = construct(arguments[0],defaultArgs.concat(arguments[1]));
		this.widgetList.push(widget);
		return widget;
	}
};

function Table(parent, id, name, description) {
	Tabular.call(this, parent, id, name, description);
	this.jElement = $('<table class="area"></table>').appendTo(this.parent.getJElement());
};

Table.prototype = {
	
};


function TableRow(parent, id, name, description) {
	Tabular.call(this, parent, id, name, description);
	this.jElement = $('<tr></tr>').appendTo(this.parent.getJElement());
	this.jElement.addClass('table-row');
};

TableRow.prototype = {
	
};

function TableField(parent, id, name, description) {
	Tabular.call(this, parent, id, name, description);
	this.jElement = $('<td></td>').appendTo(this.parent.getJElement());
	this.text = '';
    this.clickListeners = [];
	this.addClickListener(this.jElement, this.clicked);
};

TableField.prototype = {	
    click : function (action, thisArg) {
		this.clickListeners.push([action, thisArg])
	},
	clicked: function(event){
		if (!this.disabled) {
			for (var i = 0 ; i < this.clickListeners.length ; i++) {
				this.clickListeners[i][0].apply(this.clickListeners[i][1], [event]);
			}
		}
	},	
	setWidth : function(value) {
		this.getJElement().width(value)
		this.getJElement().css({'max-width':value})
	},
	setText : function(value) {
		this.text = value;
		this.getJElement().text(value);
	},
    setTitle : function(value) {
        this.getJElement().attr('title', value);
    },
	getText : function() {
		return this.text;
	},	
	addWidget : function(args) {
		defaultArgs = [this, uniId++, arguments[0].type, 'ToDo']
		var widget = construct(arguments[0],defaultArgs.concat(arguments[1]));
		this.widgetList.push(widget);
		return widget;
	}
};

extend(Tabular, Table);
extend(Tabular, TableRow);
extend(Tabular, TableField);

// Ui Connector


function UiHandler(body, area, navArea, resizer){
	
	this.area = area;
	this.navArea = navArea;
    
    this.resizer = resizer;
	
	this.body = body;
	this.uiOLInt = 0;
	this.uiOverlays = {};
	this.uiInstInt = 0;
	this.uiConnections = {};
	
	this.viewID = 0;
	this.viewList = {};
	this.btnID = 0;
	this.btnList = {};
	this.btnAssign = {};
}

UiHandler.prototype = {
	showOverlay : function() {
		var id = this.uiOLInt++;
		var tmpOL = new Overlay(this.body, id, 'Overlay', 'Overlay');
		this.uiOverlays[id] = tmpOL;
		return tmpOL;
	},
	showOverlayDisp : function() {
		var id = this.uiOLInt++;
		var tmpOL = new OverlayDisplay(this.body, id, 'Overlay', 'Overlay');
		this.uiOverlays[id] = tmpOL;
		return tmpOL;
	},
	uiConnect : function(widget, fValue, interval, form) {
		var id = this.uiInstInt++;
		var tmp = new UiConnector(id, widget, fValue, interval, form);
		this.uiConnections[id] = tmp;
	},	
	addView : function(args) {
		// Class, name, description, *additional args
		// parent, id, name, description
		var id = this.viewID++;
		defaultArgs = [this.area, id];
		var view = construct(arguments[0],defaultArgs.concat(arguments[1]));
		if (Object.keys(this.viewList).length == 0) {
			view.setVisibility(true);
		} else {
			view.setVisibility(false);
		}
		this.viewList[id] = view;
		return view;
	},
	addNavButton : function(view, area, style) {
		var id = this.btnID++;
		if (area === undefined) {
			area = this.area
		}
		if (style === undefined) {
			style = NavButton
		}
		//parent, id, name, description, callee, action, text, imagePath
		var navBtn = construct(style,[area, id, view.name, view.describtion, view.name]);
		navBtn.click(this.selectView, this);
		this.btnList[id] = navBtn;
		this.btnAssign[id] = view;
		return navBtn;
	},
	selectView : function(event) {
		for ( var el in this.btnList ) {
			if (this.btnList[el].jElement.has(event.target).length) {
				this.activateView(this.btnAssign[this.btnList[el].id]);
				break;
			};
		};
	},
	activateView : function(view) {
		for ( var el in this.viewList ) {
			if (this.viewList[el].id !== view.id) {
				this.viewList[el].setVisibility(false)
			}
			
		}
		view.setVisibility(true);
	}
};

function UiConnector(id, widget, fValue, interval, form) {
	this.id = id;
	this.interval = interval;
	this.widget = widget;
        this.form = form;
        this.formAction = undefined;
	this.setUpWidgetListners(this);
	this.fValue = fValue;
	this.setDisabled(true)
	this.setInterval(this);
};

UiConnector.prototype = {
	setId : function(id) {
		this.id = id;
	},
	setDisabled : function(value) {
		if ( typeof this.widget.setDisabled === 'function' ) {
			this.widget.setDisabled(this.widget, value)
		}
	},
	sync : function() {
		if ( this.widget.type === 'Label' || this.widget.type === '_Label') {
			this.widget.setText(this.fValue());
		} else if ( this.widget.type === 'Input') {
			this.widget.setValue(this.fValue());
		} else if ( this.widget.type === 'Indicator') {
			this.widget.setText(this.fValue())
		};
	},	
	iFunction : function() {
		if (this.interval > 0) {
			var callee = this;
			return window.setInterval( function() {
				callee.sync.apply(callee,[])
			}, this.interval );
		} else {
			this.sync();
		}
	},
	setUpWidgetListners : function() {
		if ( this.widget.type === 'Label' || this.widget.type === '_Label') {
			
		} else if ( this.widget.type === 'Input') {
		
		};
	},
	clearInterval : function() {
		window.clearInterval(this.iInst);
	},
	setInterval : function() {
		this.iInst = this.iFunction();
	}
};

var defaultVersion = '1.0.0';
//var domains = ['detector','monitor','filewriter','stream'];
var domains = ['detector','monitor','filewriter'];
var subdomains = ['config', 'status', 'command'];
var detkeys = {'config':["keys","auto_summation", "beam_center_x", "beam_center_y", "countrate_correction_applied", "countrate_correction_bunch_mode", "count_time", "data_collection_date", "detector_number", "efficiency_correction_applied", "element", "flatfield_correction_applied", "frame_time", "nimages", "number_of_excluded_pixels", "photon_energy", "pixel_mask_applied", "sensor_material", "sensor_thickness", "software_version", "threshold_energy", "trigger_mode", "virtual_pixel_correction_applied", "ntrigger"]
				, 'status' : ["keys","state"]
				, 'command' : ['initialize','arm','disarm','trigger','cancel','abort']};
var monkeys = {'config': ["keys"], 
				'status': ["keys"], 
				'command': []};
var fwrkeys = {'config': ["keys","transfer_mode", "image_nr_start", "mode", "nimages_per_file", "name_pattern", "compression_enabled"], 
				'status': ["keys","state", "error", "time", "buffer_free"], 
				'command': ["clear"]};

var stmkeys = {'config': ["keys"], 
    'status': ["keys"], 
    'command': []};

var specialKeys = [{'domain' : 'detector', 'subdomain' : 'version', 'versionInURI' : false},
                    {'domain' : 'monitor', 'subdomain' : 'version', 'versionInURI' : false},
                    {'domain' : 'filewriter', 'subdomain' : 'version', 'versionInURI' : false},
					{'domain' : 'filewriter', 'subdomain' : 'files', 'versionInURI' : true},
					{'domain' : 'monitor', 'subdomain' : 'images', 'versionInURI' : true}];
				
var keys = {};
keys[domains[0]] = detkeys; 
keys[domains[1]] = monkeys; 
keys[domains[2]] = fwrkeys;
//keys[domains[3]] = stmkeys;

var excludedKeys = ['clear', 'pixel_mask', 'flatfield'];

function inExcludedKeys(key) {
    for (var index in excludedKeys) {
        if (excludedKeys[index] === key) { return true; };
    }
    return false;
}

// EIGER Queries
/*
Query Statuses:
-1: Failed
0: Queued
1: Started
2: Successfully Ended
*/
function EIGERQuery(instance, handler, method, data) {
	this.id = undefined;
	this.handler = handler;
	this.method = method;
	this.instance = instance;
	this.data = data;
	this.status = 0;
};

EIGERQuery.prototype = {
	setId : function(id) {
		this.id = id;
	},
	getId : function() {
		return this.id;
	},
	getText : function() {
	return sprintf('[%s] %s:%s | %s | %s | %s',
				this.method, 
				this.instance.superDet.address,
				this.instance.superDet.port,
				this.instance.domain.index, 
				this.instance.subdomain.index, 
				this.instance.index);
	},
	setStatus : function(status) {
		this.status = status;
	},
	exec : function() {
		if ( this.status === 0) {
			this.handler.execQuery(this);
		};
	},
	deleteQ : function() {
		if (this.status === 1) {
			this.handler.abort(this);
		} else if ( this.status === 0 ) {
			this.handler.deleteQ(this);
		}
		this.status = -2;
		this.handler.notifyQListenerUpdate(this);
	},
	setResponse : function(response) {
		this.response = response;
	},
	getResponse : function() {
		return this.response;
	}
};

function EIGERMQuery(handler, cmd, widget, newQItemCallback, updateQItemCallback) {
	this.qListener = {'widget' : widget,
					'newCallback' : newQItemCallback, 
					'updateCallback' : updateQItemCallback};
							
	this.id = undefined;
	this.handler = handler;
	this.status = 0;
	
	this.listOfQueues = cmd[0].apply(cmd[1][0],cmd[1]);
	
	this.qDone = 0;
	this.qCount = this.listOfQueues.length;
	
	this.progress = 0;
};

EIGERMQuery.prototype = {
	getText : function() {
		return ''; //todo
	},
	getProgress : function() {
		return ( this.qDone / this.qCount );
	},
	getQDone : function() {
		return this.qDone;
	},	
	getQCount : function() {
		return this.qCount;
	},
	setId : function(id) {
		this.id = id;
	},
	getId : function() {
		return sprintf('M%s',this.id);
	},
	setStatus : function(status) {
		this.status = status;
	},
	exec : function() {
		this.handler.addQueueListener(this, this.updateQ, this.newQ);
		this.status = 1;
		for ( var el in this.listOfQueues) {
			this.listOfQueues[el].exec();
		}
	},
	newQ : function (qInstance) {

	},
	updateQ : function (qInstance) {
		if (this.checkQueued(qInstance)) {
			if  ( qInstance.status === 2 ) {
				this.qDone++;
			} else if  ( qInstance.status === -1 ) {
				this.qDone++;
				this.status = -1;
			}
			if (this.qDone === this.qCount && this.status === 1) {
				this.status = 2;
				this.handler.removeQueueListener(this);
			}
			this.qListener['updateCallback'].apply(this.qListener['widget'], [this]);
		}
	},
	checkQueued : function (qInstance) {
		for (var el in this.listOfQueues) {
			if (this.listOfQueues[el] === qInstance) {
				return true;
			}
		}
		return false;
	},
	deleteQ : function() {
		this.status = -2;
		for (var el in this.listOfQueues) {
			this.listOfQueues[el].deleteQ();
		}
		this.handler.notifyQListenerUpdate(this);
	}
};

// EIGER Command Handler
function EIGERHandler() {
	this.qInstInt = 0;
	this.activeQueries = {};
	this.history = 0;
	this.qListerInt = 0;
	this.qListenerList = {};
};

EIGERHandler.prototype = {
	add2Queue : function(qInstance, noExec) {
		var id = this.qInstInt++;
		qInstance.setId(id);
		this.notifyQListenerNew(qInstance);
		this.activeQueries[id] = qInstance;
		if (!noExec) {
			qInstance.exec();
		}
		return qInstance;
	},
	addQueryListenerList : function (list) {
		for (var index in list) {
			this.qListenerList[this.qListerInt++] = list[index];
		}
	},
	addQueueListener : function(widget, updateQItemCallback, newQItemCallback) {
		var id = this.qListerInt++;
		this.qListenerList[id] = {'widget' : widget,
								'newCallback' : newQItemCallback, 
								'updateCallback' : updateQItemCallback};
	},
	abort : function (qInstance) {
		qInstance.request.abort();
		for (var index in this.activeQueries) {
			if ( this.activeQueries[index] === qInstance ) {
				delete this.activeQueries[index];
				break;
			}
		}
	},
	deleteQ : function (qInstance) {
		for (var index in this.activeQueries) {
			if ( this.activeQueries[index] === qInstance ) {
				delete this.activeQueries[index];
				break;
			}
		}
	},	
	abortAllKeyRequests : function (key) {
		for (var index in this.activeQueries) {
			if ( this.activeQueries[index].instance === key ) {
				console.log('canceled request');
				this.activeQueries[index].request.abort();
				delete this.activeQueries[index];
			}
		}
	},
	getQueryStatusListeners : function () {
		return this.qListenerList;
	},
	removeQueueListener : function(listener) {
		for (var el in this.qListenerList) {
			if ( this.qListenerList[el]['widget'] === listener ) {
				delete this.qListenerList[el];
			};
		};
	},
	removeAllQueryStatusListeners : function () {
		this.qListenerList = [];
		this.qListerInt = 0;
	},
	notifyQListenerNew : function(qInstance) {
		for (var el in this.qListenerList) {
			if (this.qListenerList[el]['newCallback'] !== undefined) {
				this.qListenerList[el]['newCallback'].apply(this.qListenerList[el]['widget'],[qInstance]);
			}
		}
	},
	notifyQListenerUpdate : function(qInstance) {
		for (var el in this.qListenerList) {
			this.qListenerList[el]['updateCallback'].apply(this.qListenerList[el]['widget'],[qInstance]);
		}
	},
	execQuery: function(qInstance) {
		qInstance.setStatus(1);
		this.notifyQListenerUpdate(qInstance);
		var callee = this;
		if (qInstance.instance.versionInURI === true) {
			var url = sprintf('http://%s:%s/%s/api/%s/%s/%s',
				qInstance.instance.superDet.address, 
				qInstance.instance.superDet.port, 
				qInstance.instance.domain.index, 
				qInstance.instance.superDet.version, 
				qInstance.instance.subdomain.index, 
				qInstance.instance.index);
		} else {
			var url = sprintf('http://%s:%s/%s/api/%s/%s',
				qInstance.instance.superDet.address, 
				qInstance.instance.superDet.port, 
				qInstance.instance.domain.index, 
				qInstance.instance.subdomain.index, 
				qInstance.instance.index);
		};
		qInstance.startTime = new Date().getTime();
        switch (qInstance.instance.index) {
            case 'trigger' :
                var timeout = (qInstance.instance.superDet.detector.config.frame_time.value.value*qInstance.instance.superDet.detector.config.nimages.value.value+10)*2000;
                console.log(sprintf('Setting timeout %s ms (%s)...', timeout, qInstance.instance.index));
                break;
            case 'arm':
            case 'initialize':
                var timeout = 330000;
                console.log(sprintf('Setting timeout %s ms (%s)...', timeout, qInstance.instance.index));
                break;
            default:
                var timeout = 60000;
                break
        }
		qInstance.request = $.ajax({
			url: url,
			type: qInstance.method,
			contentType: "application/json",
            timeout: timeout,
			data: qInstance.data
			});
		qInstance.request.done(function(data) { 
				callee.sucess.apply(callee, [qInstance, data]);
		});
		qInstance.request.fail(function(data) { 
				callee.error.apply(callee, [qInstance, data]);
		});

	},
	sucess : function(qInstance, data) {
		qInstance.setStatus(2);
		qInstance.endTime = new Date().getTime();
		qInstance.setResponse(data);
		this.notifyQListenerUpdate(qInstance);
		this.history++;
		delete this.activeQueries[qInstance.id];
	},
	error : function(qInstance, data) {
		qInstance.setResponse(data);
		qInstance.setStatus(-1);
		this.notifyQListenerUpdate(qInstance);
		this.history[qInstance.id] = qInstance;
		this.history++;
		delete this.activeQueries[qInstance.id];
	}
};

function EIGERContainer() {
	this.versionInURI = true;
	this.refreshListeners = [];
};

EIGERContainer.prototype = {
	addChilds : function(list) {
		var containerList = {};
		for ( var i = 0 ; i < list.length ; i++ ) {
			var child = this.constructChild(list[i]);
			containerList[list[i]] = child;
			this[list[i]] = child;
		}
		return containerList;
	},	
	refresh : function (action, thisArg) {
		this.refreshListeners.push([action, thisArg]);
	},
	refreshed: function(event){
		for (var i = 0 ; i < this.refreshListeners.length ; i++) {
			this.refreshListeners[i][0].apply(this.refreshListeners[i][1], [event]);
		}
	},	
	queueQuery : function(method, data, noExec) {
		return this.superDet.handler.add2Queue(new EIGERQuery(this, this.superDet.handler, method, data), noExec);
	},
	queueGetQuery : function(noExec) {
		return this.queueQuery('GET', '', noExec);
	},
	queuePutQuery : function(data, noExec) {
		return this.queueQuery('PUT', data, noExec);
	},
	queueDeleteQuery : function(noExec) {
		return this.queueQuery('DELETE', '', noExec);
	},
	update : function (noExec) {
		if ( this instanceof EIGERKey || this instanceof EIGERSpecialKey ) {
			if (this.access_mode.value !== 'w') {
				return [this.queueGetQuery(noExec)];
			};
		} else {
			var qList = [];
			for (var el in this.children) {
				var retArr = this.children[el].update(noExec);
				if (retArr !== undefined) {
					qList = qList.concat(retArr);
				}
			};
			return qList;
		}
	}
};

function EIGER(address, port, handler, version) {
	EIGERContainer.call(this);
	this.address = address;
	this.port = port;
	this.index = 'detector';
	//if (version === undefined){
		this.version = defaultVersion;
	//} else {
	//	this.version = version;
	//};
	console.log(this);
	
	this.connectionStateID = 0;
	
	this.handler = handler;
	console.log(handler);
	this.children = this.addChilds(domains);
	
	this.handler.addQueueListener(this, this.updateQItem) 
};

EIGER.prototype = {
	constructChild : function(index) {
		return new EIGERDomain(this, index);
	},
	setHost : function(address, port) {
		this.address = address;
		this.port = port;
	},
	setVersion : function (version) {
		this.version = version;
	},
	updateQItem : function(qInstance) {
		if (qInstance.status === 2) {
			qInstance.instance.updateValues(qInstance.getResponse(qInstance));
		}
	},
	unbind : function() {
		this.handler.removeQueueListener(this) 
	}
};


function EIGERDomain(superDet, index) {
	EIGERContainer.call(this);
	this.superDet = superDet;
	this.index = index;
    this.name = index;
	this.children = this.addChilds(subdomains);
	for (var index in specialKeys){
		if (specialKeys[index]['domain'] === this.index) {
			this.children[specialKeys[index]['subdomain']] = new EIGERSpecialKey(this.superDet, this, specialKeys[index]['subdomain'], specialKeys[index]['versionInURI']);
			this[specialKeys[index]['subdomain']] = this.children[specialKeys[index]['subdomain']];
		}
	}
};

EIGERDomain.prototype = {
	constructChild : function(index) {
		return new EIGERSubDomain(this.superDet, this,  index);
	}
};

function EIGERSubDomain(superDet, domain, index) {
	EIGERContainer.call(this);
	this.superDet = superDet;
	this.domain = domain;
	this.index = index;
    this.name = index;
	this.children = this.addChilds(keys[this.domain.index][this.index]);
};

EIGERSubDomain.prototype = {
	constructChild : function(index) {
		return new EIGERKey(this.superDet, this.domain, this,  index);
	}
};

function EIGERKey(superDet, domain, subdomain, index) {
	EIGERContainer.call(this);
	this.superDet = superDet;
	this.domain = domain;
	this.subdomain = subdomain;
	this.index = index;
    this.name = index;
	this.children = {};
	if ( this.subdomain.index === 'command' ) {
		this.constructChild('access_mode', 'w');
	} else {
		this.constructChild('access_mode', '');
	};
};

EIGERKey.prototype = {
	constructChild : function(index, value) {
		var tmp = new EIGERValue(this.superDet, this.domain, this.subdomain, this, index, value);
		this.children[index] = tmp;
		this[index] = tmp;
	},
    updateKey : function (noExec) {
        if (this.access_mode.value !== 'w') {
            return this.queueGetQuery(noExec);
        };
    },
	updateValues : function(valueTuple) {
		if (this.index === 'keys') {
			for (var vIndex in valueTuple) {
				var inKeys = false;
				for (var kIndex in keys[this.domain.index][this.subdomain.index]) {
					if (keys[this.domain.index][this.subdomain.index][kIndex] === valueTuple[vIndex]) {
						inKeys = true;
						break;
					}
				}
				if (!inKeys && !inExcludedKeys(valueTuple[vIndex])) {
					keys[this.domain.index][this.subdomain.index].push(valueTuple[vIndex]);
				}
			}
		}
		for (var index in valueTuple) {
			if (this[index] !== undefined) {
				this[index].value = valueTuple[index];
			} else {
				this.constructChild(index, valueTuple[index]);
			}
		}
		this.refreshed();
	},
	setValue : function(value, noExec) {
		return this.queuePutQuery(JSON.stringify({'value':value}), noExec);
	}
};

function EIGERSpecialKey(superDet, domain, subdomain, versionInURI) {
	EIGERContainer.call(this);
	this.superDet = superDet;
	this.domain = domain;
	this.subdomain = {};
	this.subdomain.index = subdomain;
	this.versionInURI = versionInURI;
	this.index = '';
    this.name = subdomain;
	this.children = {};
	this.constructChild('access_mode', 'r');
};

EIGERSpecialKey.prototype = {
	constructChild : function(index, value) {
		var tmp = new EIGERValue(this.superDet, this.domain, this.subdomain, this, index, value);
		this.children[index] = tmp;
		this[index] = tmp;
	},
    updateKey : function (noExec) {
        if (this.access_mode.value !== 'w') {
            return this.queueGetQuery(noExec);
        };
    },
	updateValues : function(valueTuple) {
		if ('value' in valueTuple) {
			for (var index in valueTuple) {
				if (this[index] !== undefined) {
					this[index].value = valueTuple[index]
				} else {
					this.constructChild(index, valueTuple[index]);
				}
			}
		} else {
			var index = 'value';
			if (this[index] !== undefined) {
				this[index].value = valueTuple;
			} else {
				this.constructChild(index, valueTuple);
			}
		}
		this.refreshed();
	},
	setValue : function(value, noExec) {
		this.queuePutQuery(JSON.stringify({'value':value}), noExec);
	}
};

function EIGERValue(superDet, domain, subdomain, key, index, value) {
	this.superDet = superDet;
	this.domain = domain;
	this.subdomain = subdomain;
	this.key = key;
	this.index = index;
	this.value = value;
};

EIGERValue.prototype = {
	update : function (noExec) {
		this.key.update(noExec);
	}
};

extend(EIGERContainer, EIGER);
extend(EIGERContainer, EIGERDomain);
extend(EIGERContainer, EIGERSubDomain);
extend(EIGERContainer, EIGERKey);
extend(EIGERContainer, EIGERSpecialKey);

// Connection Settings Widget
function EIGERConSet(parent, id, name, description, ui, eUi) {
	ContainerArea.call(this, parent, id, name, description);
	this.ui = ui;
	this.ui.cset = this;
	this.eUi = eUi;
	this.type = 'ConnectionWidget';
	this.ttl01 = this.addWidget(Title,[])
	this.ttl01.setLvl('h2');
	this.ttl01.setText('EIGER Connection Settings');
	
	this.addNewLine();
	
	this.frm01 = this.addWidget(Form,[])
	
	this.inp01 = this.frm01.addWidget(Input,[]);
	this.inp01.setTitle('Address');
	this.inp01.setValue(document.domain);
	
	this.inp02 = this.frm01.addWidget(Input,[]);
	this.inp02.setTitle('Port');
	
	this.btn01 = this.frm01.addWidget(SubmitButton,['connect']);
	
	this.frm01.submit(this.connect, this);
}

EIGERConSet.prototype = {
	connect : function(event) {
		this.eUi.connect(this.inp01.getValue(), this.inp02.getValue());
	},
	disconnect : function(event) {
		alert('Not Implemented!');
	}
};

function EIGERAcqSet(parent, id, name, description, ui, eUi) {
	ContainerArea.call(this, parent, id, name, description);
	this.ui = ui;
	this.ui.acq = this;
	this.eUi = eUi;
	this.type = 'Acquisition Settings';
    
    this.advWidgets = [];
	
	// page2, acquisition settings
	
	this.ttl01 = this.addWidget(Title,[]);
	this.ttl01.setLvl('h4');
	this.ttl01.setText('Commands');
	this.addAdvWidget(this.ttl01);
    this.addAdvWidget(this.addNewLine());
    
	this.btn01 = this.addWidget(Button,['Initialize']);
	this.btn01.click(this.init, this);
	this.addAdvWidget(this.btn01);
    
	this.btn02 = this.addWidget(Button,['Disarm']);
	this.btn02.click(this.disarm, this);
	this.addAdvWidget(this.btn02);
    
	this.btn03 = this.addWidget(Button,['Abort']);
	this.btn03.click(this.abort, this);
	this.addAdvWidget(this.btn03);
    
 	this.btn04 = this.addWidget(Button,['Custom Queue']);
	this.btn04.click(this.customQ, this);
	this.addAdvWidget(this.btn04);   
    
    this.addAdvWidget(this.addNewLine());
		
	this.ttl01 = this.addWidget(Title,[]);
	this.ttl01.setLvl('h4');
	this.ttl01.setText('Settings');

	this.frm01 = this.addWidget(Form,[]);
	
	this.inp01 = this.frm01.addWidget(Input,[]);
	this.inp01.setTitle('Photon Energy [eV]');
	eUi.uiConnect(this.inp01, eUi.e.detector.config.photon_energy, 1, this.frm01);
	eUi.uiConnect(this.inp01, eUi.e.detector.config.photon_energy, 1, this.frm01);
	this.addAdvWidget(this.inp01);
	
	this.inp02 = this.frm01.addWidget(Input,[]);
	this.inp02.setTitle('Threshold Energy [eV]');
	eUi.uiConnect(this.inp02, eUi.e.detector.config.threshold_energy, 1, this.frm01);
	this.addAdvWidget(this.inp02);
	
	this.sel01 = this.frm01.addWidget(Select,[]);
	this.sel01.setTitle('Elements');
	eUi.uiConnect(this.sel01, eUi.e.detector.config.element, 1, this.frm01);
	
	this.frm01.addNewLine();
	
	this.inp03 = this.frm01.addWidget(Input,[]);
	this.inp03.setTitle('Count Time');
	eUi.uiConnect(this.inp03, eUi.e.detector.config.count_time, 1, this.frm01);
	
	this.inp03 = this.frm01.addWidget(Input,[]);
	this.inp03.setTitle('Frame Time');
	eUi.uiConnect(this.inp03, eUi.e.detector.config.frame_time, 1, this.frm01);
	
	this.inp05 = this.frm01.addWidget(Input,[]);
	this.inp05.setTitle('Number of Images');
	eUi.uiConnect(this.inp05, eUi.e.detector.config.nimages, 1, this.frm01);

	this.frm01.addNewLine();	
	
	this.chk01 = this.frm01.addWidget(CheckBox,[]);
	this.chk01.setTitle('Apply Flatfield Correction');
	eUi.uiConnect(this.chk01, eUi.e.detector.config.flatfield_correction_applied, 1, this.frm01);
	this.addAdvWidget(this.chk01);
	
	this.chk02 = this.frm01.addWidget(CheckBox,[]);
	this.chk02.setTitle('Apply Countrate Correction');
	eUi.uiConnect(this.chk02, eUi.e.detector.config.countrate_correction_applied, 1, this.frm01);
	this.addAdvWidget(this.chk02);

	
	this.addAdvWidget(this.frm01.addNewLine());	

	this.inp06 = this.frm01.addWidget(Input,[]);
	this.inp06.setTitle('Number of Triggers');
	eUi.uiConnect(this.inp06, eUi.e.detector.config.ntrigger, 1, this.frm01);
	this.addAdvWidget(this.inp06);	
    
	this.sel02 = this.frm01.addWidget(Select,[]);
	this.sel02.setTitle('Trigger Mode');
	eUi.uiConnect(this.sel02, eUi.e.detector.config.trigger_mode, 1, this.frm01);
	this.addAdvWidget(this.sel02);	
	
	this.addAdvWidget(this.frm01.addNewLine());		
	
	this.inp07 = this.frm01.addWidget(Input,[]);
	this.inp07.setTitle('Name Pattern');
	eUi.uiConnect(this.inp07, eUi.e.filewriter.config.name_pattern, 1, this.frm01);
	this.addAdvWidget(this.inp07);	
    
	this.inp08 = this.frm01.addWidget(Input,[]);
	this.inp08.setTitle('NImages per Data File');
	eUi.uiConnect(this.inp08, eUi.e.filewriter.config.nimages_per_file, 1, this.frm01);
	this.addAdvWidget(this.inp08);	
	
	this.sel03 = this.frm01.addWidget(Select,[]);
	this.sel03.setTitle('FileWriter Mode');
	eUi.uiConnect(this.sel03, eUi.e.filewriter.config.mode, 1, this.frm01);
	this.addAdvWidget(this.sel03);	
	
	this.frm01.addNewLine();	
	this.frm01.addNewLine();	
	
	this.chk04 = this.frm01.addWidget(CheckBox,[]);
	this.chk04.setTitle('Expert Mode');
	this.chk04.setDisabled(true);
	
	this.setAdvModeElVisibility(false);
	
	var callee = this;
	this.chk04.jInput.change(function(event){
			callee.toggleAdvanced.apply(callee,[]);
		});
	
	this.btn05 = this.frm01.addWidget(SubmitButton,['Acquire']);
	this.frm01.submit(this.acquire, this);
}

EIGERAcqSet.prototype = {
	acquire : function() {
        if (this.eUi.e.detector.status.state.value.value !== 'idle') {
            alert('Detector is not in idle state, will not start exposure.\n\nPlease disarm detector or abort exposure.')
        } else {
            if (!this.advMode) {
                new EIGERExp(this.ui, this.eUi, 'expose');
            } else {
                new EIGERExp(this.ui, this.eUi, 'advExpose');
            }
        }
	},
	toggleAdvanced : function () {
		if (!this.advMode && this.eUi.e.connectionStateID === 2) {
			this.enableAdvMode();
		} else {
			this.disableAdvMode();
		}
	},
	enableAdvMode : function () {
		this.setAdvModeElVisibility(true);
	},
	disableAdvMode : function () {
		
		this.cmd01 = new EIGERSubseqCmdPrompt( this.ui.body, 0, 'EHC', 'EIGER Command Handler', this.eUi, {'success' : [this.success, this, []],'error' : [function () {}, this, []]});
		
		this.cmd01.setTitle('Preparing standard user mode...');
		this.cmd01.setHeight('140px');
		
		this.cmd01.addQObj(this.eUi.e.detector.config.ntrigger.setValue(1));
		this.cmd01.addQObj(this.eUi.e.detector.config.flatfield_correction_applied.setValue(true));
		this.cmd01.addQObj(this.eUi.e.detector.config.countrate_correction_applied.setValue(true));
		this.cmd01.addQObj(this.eUi.e.detector.config.trigger_mode.setValue('ints'));
		this.cmd01.addQObj(this.eUi.e.filewriter.config.mode.setValue('enabled'));
		this.cmd01.addQObj(this.eUi.e.filewriter.config.name_pattern.setValue(sprintf('BRUENIG_%s_$id', new Date().toISOString().slice(0, 10))));
		this.setAdvModeElVisibility(false);
	},
    addAdvWidget : function (widget) {
        this.advWidgets.push(widget);
    },
	setAdvModeElVisibility : function (value) {
		this.advMode = value;
		for (var index in this.advWidgets) {
            this.advWidgets[index].setVisibility(value);
        }
		this.chk04.setValue(value);
	},
	init : function() {
		new EIGERExp(this.ui, this.eUi, 'initialize');
	},
    disarm : function() {
        new EIGERExp(this.ui, this.eUi, 'disarm');
    },
    abort : function() {
        new EIGERExp(this.ui, this.eUi, 'abort');
    },
    customQ : function() {
        this.cmd01 = new EIGERCustomCmdPrompt( this.ui.body, 0, 'EHC', 'EIGER Command Handler', this.eUi, {'success' : [this.success, this, []],'error' : [function () {}, this, []]});
    },
    cmdI : function() {
        this.cmd02 = new EIGERCmdInformation( this.ui.body, 0, 'EHC', 'EIGER Command Handler', this.eUi);
    },
	success : function(data) {
		this.cmd01 = '';
	}
};

function EIGERExp (ui, eUi, action) {
	this.ui = ui;
	this.ui.exp = this;
	this.eUi = eUi;
	
	var expView = this.getView('Exposure');
	this.switchView(expView);
	
	this.cmd01 = expView.addWidget(
			EIGERSubseqCmdHandler, 
			[this.eUi,
			{'success' : [this.success, this, []],'error' : [this.error, this, []]}]
			);
	
	switch (action) {
		case 'expose' :			
			this.cmd01.addCmd(this.eUi.e.detector.command.arm, ['Put', '', true]);
			this.cmd01.addCmd(this.eUi.e.detector.command.trigger, ['Put', '', true]);
			this.cmd01.addCmd(this.eUi.e.detector.command.disarm, ['Put', '', true]);
			this.endView = 'Data';
			break;
		case 'advExpose' :
			var triggerMode = this.eUi.e.detector.config.trigger_mode.value.value;
			var nTriggers = this.eUi.e.detector.config.ntrigger.value.value;
			console.log(sprintf('Starting %s series with %s triggers...', triggerMode, nTriggers));
			this.cmd01.addCmd(this.eUi.e.detector.command.arm, ['Put', '', true]);
			if ( String(triggerMode).startsWith('int') ) {
				for (var i=0 ; i < nTriggers ; i++) {
					this.cmd01.addCmd(this.eUi.e.detector.command.trigger, ['Put', '', true], this.cmd01.EXEC_CLICK);
				}
			}
			this.cmd01.addCmd(this.eUi.e.detector.command.disarm, ['Put', '', true], this.cmd01.EXEC_ICLICK, this.cmd01.ENDING_COMMAND);
			this.endView = 'Data';
			break;
		case 'initialize' :
			this.cmd01.addCmd(this.eUi.e.detector.command.initialize, ['Put', '', true]);
			this.endView = 'Acquire';
			break;
		case 'disarm' :
			this.cmd01.addCmd(this.eUi.e.detector.command.disarm, ['Put', '', true]);
			this.endView = 'Acquire';
			break;
		case 'abort' :
			this.cmd01.addCmd(this.eUi.e.detector.command.abort, ['Put', '', true]);
			this.endView = 'Acquire';
			break;
	}
	
	this.cmd01.exec(this.cmd01);
	
}

EIGERExp.prototype = {
	getView : function(viewName) {
		for (var el in this.ui.viewList) {
			if (this.ui.viewList[el].name === viewName) {
				return this.ui.viewList[el];
			}
		}
		
	},
	switchView : function (view) {
		this.ui.activateView(view);
	},
	success : function(data) {
		this.cmd01.getJElement().remove();
		this.cmd01.btn01.getJElement().remove();
		dView = this.getView(this.endView);
		this.switchView(dView);
	},
	abortSuccess : function (data) {
		alert(sprintf('%s\n\n%s','Failed to execute an exposure.',data.statusText));
		this.cmd01 = '';
	
		this.switchView(this.getView('Acquire'));
	},
	error : function(data) {	
		this.cmd01.getJElement().remove();
		this.cmd01.btn01.getJElement().remove();
		
		this.cmd01 = new EIGERSubseqCmdPrompt( this.ui.body, 0, 'EHC', 'EIGER Command Handler', this.eUi, {'success' : [this.abortSuccess, this, []],'error' : [function () {}, this, []]});
		
		this.cmd01.setTitle('Recovering detector state...');
		this.cmd01.setHeight('35px');
		
		this.cmd01.addCmd(this.eUi.e.detector.command.abort, ['PUT','']);
	}
};

function EIGERData (parent, id, name, description, ui, eUi) {
	ContainerArea.call(this, parent, id, name, description);
	this.ui = ui;
	this.eUi = eUi;
	
	this.ttl01 = this.addWidget(Title,[])
	this.ttl01.setLvl('h2');
	this.ttl01.setText('EIGER Data');
	
	this.addNewLine();
	
	this.lgh01 = this.addWidget(EIGERDataLogger, [this.eUi]);
}

EIGERData.prototype = {
	getView : function(viewName) {
		for (var el in this.ui.viewList) {
			if (this.ui.viewList[el].name === viewName) {
				return this.ui.viewList[el];
			}
		}
		
	},
	switchView : function (view) {
		this.ui.activateView(view);
	}
};

function EIGERAcq(parent, id, name, description, ui, eUi) {
	ContainerArea.call(this, parent, id, name, description);
	this.ui = ui;
	this.eUi = eUi;
	this.type = 'AcquireSettings';
	
	this.ttl01 = this.addWidget(Title,[]);
	this.ttl01.setLvl('h4');
	this.ttl01.setText('Acquisition');
}

EIGERAcq.prototype = {

};

function EIGERLog(parent, id, name, description, ui, eUi) {
	ContainerArea.call(this, parent, id, name, description);
	this.ui = ui;
	this.ui.log = this;
	this.eUi = eUi;
	this.type = 'ConnectionWidget';
	
	var callee = this;
	
	this.ttl01 = this.addWidget(Title,[]);
	this.ttl01.setLvl('h2');
	this.ttl01.setText('EIGER Logs and Command Overview');
	
	this.addNewLine();
	
	this.ttl02 = this.addWidget(Title,[]);
	this.ttl02.setLvl('h4');
	this.ttl02.setText('Overview');
	
	this.addNewLine(this);
	
	this.ttl02.lbl01 = this.addWidget(Label,[]);
	this.ttl02.lbl01.setText('Active Commands:');
	
	this.ttl02.lbl02 = this.addWidget(Label,[]);
	this.ttl02.lbl02.setText('n/a');
	this.ttl02.lbl02.setWidth('50px');
	ui.uiConnect(this.ttl02.lbl02, function() { return Object.keys(callee.eUi.eHandler.activeQueries).length; }, 50);
	
	this.ttl02.lbl03 = this.addWidget(Label,[]);
	this.ttl02.lbl03.setText('History:');
	
	this.ttl02.lbl04 = this.addWidget(Label,[]);
	this.ttl02.lbl04.setText('n/a');
	this.ttl02.lbl04.setWidth('50px');
	ui.uiConnect(this.ttl02.lbl04, function () { return callee.eUi.eHandler.history }, 50);
	
	this.addNewLine();
	
	this.ttl03 = this.addWidget(Title,[]);
	this.ttl03.setLvl('h4');
	this.ttl03.setText('Active Commands');
	
	this.lgh01 = this.addWidget(EIGERCmdLogger, [this.eUi]);
}

EIGERLog.prototype = {
    
};

function EIGERHelp(parent, id, name, description, ui, eUi) {
	ContainerArea.call(this, parent, id, name, description);
	this.ui = ui;
	this.eUi = eUi;
	this.type = 'AcquireSettings';
	
	this.ttl01 = this.addWidget(Title,[]);
	this.ttl01.setLvl('h4');
	this.ttl01.setText('Support');
	
	this.getJElement().append($ ('<p>We want to be your partner and find solutions for your needs. <br> \
								We can support you with our broad technical expertise and application know-how.<br><br> \
								Questions and inquiries - please contact us:<br><br> \
								E-mail<br> \
								<a href="mailto:support@dectris.com">support@dectris.com</a><br><br> \
								Telephone<br> \
								+41 56 500 21 02</p> ') );
	
	this.addNewLine();
	
	this.ttl01 = this.addWidget(Title,[]);
	this.ttl01.setLvl('h4');
	this.ttl01.setText('Help');
	
	this.addNewLine();
	
	this.img01 = this.addWidget(Image,[]);
	this.img01.setSrc('im/help/Connect.jpeg');
	this.img01.setWidth('600px');	
	
	this.getJElement().append($ ('<p>1. Please enter the detectors address (name or IP).<br>The port is configured to be 80 when the input is left empty <br> \
							2. Click on the connect button to set up the client.</p> ') );
							
	this.img01 = this.addWidget(Image,[]);
	this.img01.setSrc('im/help/Settings.jpeg');
	this.img01.setWidth('600px');	
	
	this.getJElement().append($ ('<p>1. Please adapt the settings to your needs. <br> \
							2. Click on the acquire button to record a (series) of image(s).</p> ') );
							
	this.img01 = this.addWidget(Image,[]);
	this.img01.setSrc('im/help/Download.jpeg');
	this.img01.setWidth('600px');	
	
	this.getJElement().append($ ('<p>1. By clicking the download button you will start downloading a file. <br>Always make sure to download the master and the data file.<br> \
							2. Clicking the "x" button will delete the resource on the DCU. You will be asked to confirm.</p> ') );	
							
	this.img01 = this.addWidget(Image,[]);
	this.img01.setSrc('im/help/ExpertMode.jpeg');
	this.img01.setWidth('600px');	
	
	this.getJElement().append($ ('<p>Advanced users might chose to use the advanced mode. Please only use this mode if you are an expert.</p> ') );	
}

EIGERHelp.prototype = {

};

extend(ContainerArea, EIGERConSet);
extend(ContainerArea, EIGERAcqSet);
extend(ContainerArea, EIGERAcq);
extend(ContainerArea, EIGERData);
extend(ContainerArea, EIGERLog);
extend(ContainerArea, EIGERHelp);


// EIGER Data Logger

function EIGERDataLogger(parent, id, name, description, eUi) {
	BlockArea.call(this, parent, id, name, description);

	this.eUi = eUi;
	
	this.table = this.addWidget(Table,[]);
	this.table.setWidth('865px');
	this.setHeight('320px');
	this.jElement.css('overflow-y','scroll');
	this.jElement.css('overflow-x','hidden');
	
	this.ids = 0;
	
	this.rows = {};
	
	for (var el in this.eUi.eHandler.activeQueries) {
		this.newQItem(this.eUi.eHandler.activeQueries[el]);
	}
	
	this.eUi.uiConnect(this, this.eUi.e.filewriter.files, 2);
}

EIGERDataLogger.prototype = {
	setValue : function (fileList) {
		var exisitingList = [];
		for (var row in this.rows) {
			if (fileList.indexOf(this.rows[row].fileName) < 0) {
				this.updateQItem(row, 'deleted');
			}
			exisitingList.push(this.rows[row].fileName);
		}
		for (var index in fileList) {
			if (exisitingList.indexOf(fileList[index]) < 0) {
				this.newQItem(fileList[index]);
			}			
		}
	},
	updateQItem : function (id, status) {
		switch (status) {
			case 'new': 
				this.rows[id].tfd03.ind01.setText('new');
				this.rows[id].tfd03.ind01.ok();
				break;
			case 'downloaded':
				this.rows[id].tfd03.ind01.setText('downloaded');
				this.rows[id].tfd03.ind01.grey();
				break;
			case 'deleted':
				this.rows[id].tfd03.ind01.setText('deleted');
				this.rows[id].tfd03.ind01.error();
				var callee = this;
				this.rows[id].getJElement().delay(1000).slideUp(200, function() {
					callee.rows[id].getJElement().remove();
					delete callee.rows[id];
				});
				break;
			case 'deleting':
				this.rows[id].tfd03.ind01.setText('deleting');
				this.rows[id].tfd03.ind01.warning();
				break;
		}
		this.rows[id].status = status;
	},
	newQItem : function (fileName) {
		var id = this.ids++;
		
		this.rows[id] = this.table.addWidget(EIGERDataTableRow, []);
		this.rows[id].fileName = fileName;
		
		this.rows[id].tfd01.setText(id);
		this.rows[id].tfd02.setText(fileName);
		this.rows[id].tfd04.setText('');
		
		var callee = this;
		this.rows[id].tfd04.btn01 = this.rows[id].tfd04.addWidget(Button,['download']);
		this.rows[id].tfd04.btn01.click(function() {callee.getData(id)}, this);
        
		this.rows[id].tfd04.btn02 = this.rows[id].tfd04.addWidget(Button,['x']);
		this.rows[id].tfd04.btn02.click(function() {callee.delData(id)}, this);
		
		this.updateQItem(id, 'new');
	},
	getData : function (id) {
		window.location = sprintf('http://%s:%s/data/%s',
					this.eUi.e.address, 
					this.eUi.e.port, 
					this.rows[id].fileName
					);
		this.updateQItem(id, 'downloaded');
	},
	delData : function (id) {
		if (confirm(sprintf('Do you really want to delete the file %s on the detector control unit.', this.rows[id].fileName)))
		{
			var callee = this;
			$.ajax({
				url: sprintf('http://%s:%s/data/%s',
					this.eUi.e.address, 
					this.eUi.e.port, 
					this.rows[id].fileName
					),
				type: 'delete',
				contentType: "application/json",
				success: function(data) { 
					this.updateQItem.apply(callee, [id, 'deleting']);
				},
				error: function(data) { 
					alert('Could not delete file.');
				}
			});
		}
	}
};


// EIGER Log Command Display

function EIGERCmdLogger(parent, id, name, description, eUi) {
	BlockArea.call(this, parent, id, name, description);

	this.eUi = eUi;
	
	this.table = this.addWidget(Table,[]);
	this.table.setWidth('865px');
	this.setHeight('320px');
	this.jElement.css('overflow-y','scroll');
	this.jElement.css('overflow-x','hidden');
	
	this.rows = {};
	
	for (var el in this.eUi.eHandler.activeQueries) {
		this.newQItem(this.eUi.eHandler.activeQueries[el]);
	}
	
	this.eUi.addQueryStatusListener(this.updateQItem, this.newQItem, this);
}

EIGERCmdLogger.prototype = {
	updateQItem : function (qInstance) {
		var id = qInstance.getId();
		var callee = this;
		
		if ( qInstance.status === 0 ) {
			this.rows[id].tfd03.ind01.setText('queued');
			this.rows[id].tfd03.ind01.grey();
		} else if  ( qInstance.status === 1 ) {
			this.rows[id].tfd03.ind01.setText('sent');
			this.rows[id].tfd03.ind01.warning();
		} else if  ( qInstance.status === 2 ) {
			this.rows[id].tfd03.ind01.setText('sucess');
			this.rows[id].tfd03.ind01.ok();
			this.rows[id].getJElement().delay(500).slideUp(100, function() {
				callee.rows[id].getJElement().remove();
				callee.rows[id] = undefined;
				delete callee.rows[id];
			});
		} else if  ( qInstance.status < 0 ) {
			if (this.rows[id] !== undefined) {
				this.rows[id].tfd03.ind01.setText('error');
				this.rows[id].tfd03.ind01.error();
				if (qInstance.response){
					this.rows[id].tfd04.setText(qInstance.response.statusText);
					this.rows[id].tfd04.setTitle(qInstance.response.statusText);
				}
				this.rows[id].getJElement().delay(500).slideUp(100, function() {
					callee.rows[id].getJElement().remove();
					callee.rows[id] = undefined;
                    delete callee.rows[id];
					qInstance.deleteQ();
				});
			}
		}
	},
	newQItem : function (qInstance) {
		var id = qInstance.getId();
		
		this.rows[id] = this.table.addWidget(EIGERTableRow, []);
		
        var callee = this;
		this.rows[id].tfd01.setText(id);
        this.rows[id].tfd01.click(function () {callee.showCmdInformation.apply(callee, [qInstance]) }, this);
        this.rows[id].tfd02.setText(qInstance.getText());
        this.rows[id].tfd02.click(function () {callee.showCmdInformation.apply(callee, [qInstance]) }, this);
        this.rows[id].tfd04.setText('');
		
		this.updateQItem(qInstance);
	},
    showCmdInformation : function (qInstance) {
        var cmdInfo = new EIGERCmdInformation(this.eUi.ui.body, 0, 'EHC', 'EIGER Command Information', this.eUi)
        cmdInfo.setQ(qInstance);
    }
};

function EIGERCmdDisplay(parent, id, name, description, eUi) {
    EIGERCmdLogger.call(this, parent, id, name, description, eUi)
}

EIGERCmdDisplay.prototype = {
	newQItem : function (qInstance) {
		var id = qInstance.getId();
		
		this.rows[id] = this.table.addWidget(EIGERTableRow, []);
		
		this.rows[id].tfd01.setText(id);
		this.rows[id].tfd02.setText(qInstance.getText());
		this.rows[id].tfd04.setText('');
	}    
};

function EIGERCustomCmdPrompt(parent, id, name, description, eUi) {
	OverlayDisplay.call(this, parent, id, name, description);
	this.eUi = eUi;
    
    this.closeDone = false;
    
    this.jElement.css('cursor','default');
	this.tlt01 = this.addWidget(Title, []);
	this.tlt01.setLvl('h3');
    
    this.eUi.ui.resizer.resizeOffset(this.setOffset, this, 'top', ['mid',-200], 0);
    this.eUi.ui.resizer.resizeOffset(this.setOffset, this, 'left', ['mid',-400], 0);
	this.eUi.ui.resizer.trigger();
    
    this.tlt01.setText('Custom Command Queue Builder');
    
	this.addNewLine();
    
    var callee = this;
    
    this.frm01 = this.addWidget(Form, []);
    this.frm01.submit(this.submit, this);

    this.sel01 = this.frm01.addWidget(Select,[]);
    this.sel01.setTitle('Method');
    this.sel01.setWidth('80px');
    this.sel01.addOptions(['GET','PUT','DELETE']);
    this.sel01.jInput.change(function (event) {
        callee.changeMethod.apply(callee, [event]);
    });
    
    this.sel02 = this.frm01.addWidget(Select,[]);
    this.sel02.setTitle('Module');
    this.sel02.setWidth('80px');
    this.addOptions(this.sel02,this.eUi.e.children);
    this.sel02.jInput.change(function (event) {
        callee.changeModule.apply(callee, [event]);
    });
    
    this.sel03 = this.frm01.addWidget(Select,[]);
    this.sel03.setTitle('Task');
    this.sel03.setWidth('87px');
    this.sel03.jInput.change(function (event) {
        callee.changeTask.apply(callee, [event]);
    });
    this.sel03.setDisabled(true);
    
    this.sel04 = this.frm01.addWidget(Select,[]);
    this.sel04.setTitle('Key');
    this.sel04.setWidth('247px');
    this.sel04.jInput.change(function (event) {
        callee.changeKey.apply(callee, [event]);
    });
    this.sel04.setDisabled(true);
    
    this.inp01 = this.frm01.addWidget(Input,[])
    this.inp01.setTitle('Value');
    this.inp01.setWidth('150px');
    this.inp01.setDisabled(true);
    
    this.frm01.addNewLine();
    
    this.lbl01 = this.frm01.addWidget(Label,[]);
    this.lbl01.setWidth('500px');
    this.lbl01.setText(' ');
    
    this.chk01 = this.frm01.addWidget(CheckBox, []);
    this.chk01.setWidth('150px');
    this.chk01.setTitle('Execute manually');
    
    this.btn01 = this.frm01.addWidget(SubmitButton, ['Add To Queue'])
    this.btn01.setDisabled(true);
	
    this.addNewLine();
	
	this.cmd01 = this.addWidget(
		EIGERSubseqCmdHandler, 
		[this.eUi, {'success' : [this._done, this, []],'error' : [this._fail, this, []]}]
		);
    this.cmd01.setHeight('100px');
    
    this.addNewLine();
    
    this.chk02 = this.addWidget(CheckBox, []);
    this.chk02.setTitle('Close when finished');
    this.chk02.jInput.change( function () { callee.closeDone = callee.chk02.getValue() } )
    
    
    this.btn02 = this.addWidget(Button, ['Execute']);
    this.btn02.click(this.startQ, this);
    this.btn02.setDisabled(true);

    this.btn03 = this.addWidget(Button, ['Close']);
    this.btn03.click(this.close, this);
}

EIGERCustomCmdPrompt.prototype = {
    _done : function () {
        if (this.closeDone) {
            this.close();
        }
    },
    _fail : function () {
        alert('Failed to execute queue...');
    },
    addOptions : function (widget, list) {
        var argList = []; 
        for (var index in list) {
            argList.push(list[index].name);
        }
        widget.addOptions(argList);
        widget.setValue('');
    },
    changeModule : function (event) {
        this.enableAllModes();
        this.btn01.setDisabled(true);
        this.sel03.empty();
        this.sel03.setDisabled(false);
        this.sel04.empty();
        this.sel04.setDisabled(true);
        this.addOptions(this.sel03, this.eUi.e[this.sel02.getValue()].children);
    },
    changeTask : function (event) {
        this.enableAllModes();
        this.btn01.setDisabled(true);
        this.sel04.setDisabled(true);
        this.sel04.empty();
        if (this.eUi.e[this.sel02.getValue()][this.sel03.getValue()] instanceof EIGERSubDomain) {
            this.addOptions(this.sel04, this.eUi.e[this.sel02.getValue()][this.sel03.getValue()].children);   
            this.sel04.setDisabled(false);
        } else if (this.eUi.e[this.sel02.getValue()][this.sel03.getValue()] instanceof EIGERSpecialKey) {
            this.enableMode(this.eUi.e[this.sel02.getValue()][this.sel03.getValue()].access_mode.value);
            this.sel04.setDisabled(true);
            this.btn01.setDisabled(false);
        }
    },
    changeKey : function (event) {
        this.enableMode(this.eUi.e[this.sel02.getValue()][this.sel03.getValue()][this.sel04.getValue()].access_mode.value);
        if (this.sel01.getValue() === 'PUT') {
            this.inp01.setDisabled(false);
        }
        this.btn01.setDisabled(false);
    },
    changeMethod : function (event) {
        switch(this.sel01.getValue()) {
            case 'PUT':
                this.inp01.setDisabled(false);
                break;
            case 'GET':
            default:
                this.inp01.setDisabled(true);
                break;
        }
    },
    changeMode : function (event) {
        this.inp01.setDisabled(false);
    },
    close : function (event) {
        if (this.cmd01.status === 1) {
            this.cmd01.cancel();
        } else {
            this.remove();
        }
    },
    enableAllModes : function () {
        var options = this.sel01.jInput.find('option');
        options.each( function () { 
            $(this).prop('disabled', false);
        });
    },
    enableMode : function (modes) {
        var options = this.sel01.jInput.find('option');
        var callee = this;
        options.each( function () { 
            var disable = true;
            if (modes.search('r') >= 0) {
                if ($(this).text() === 'GET') {
                    disable = false;
                }
            }
            if (modes.search('w') >= 0) {
                if ($(this).text() === 'PUT') {
                    disable = false;
                }
            }
            $(this).prop('disabled', disable);
            if (disable && $(this).prop('selected')) {
                var enOption = callee.sel01.jInput.find('option:enabled').first();
                enOption.each( function () {
                    callee.sel01.setValue($(this).val());
                    callee.changeMethod.apply(callee,[])
                });
            }
        });
    },
    startQ : function () {
        this.btn02.setVisibility(false);
        this.frm01.setVisibility(false);
        this.cmd01.exec();
    },
    submit : function (args) {
        var subdomain = this.eUi.e[this.sel02.getValue()][this.sel03.getValue()];
        var key = (subdomain instanceof EIGERSpecialKey) ? subdomain : subdomain[this.sel04.getValue()];
        var execStyle = (this.chk01.getValue()) ? this.cmd01.EXEC_CLICK : this.cmd01.EXEC_IMMED;
        switch(this.sel01.getValue()) {
            case 'GET':
                this.addQObj(key.updateKey(true), execStyle);
                break;
            case 'PUT':
                this.addQObj(key.setValue(this.inp01.getValue(),true), execStyle);
                break;
            default:
                break;    
        }
        this.btn02.setDisabled(false);
    },
	addCmd : function (args) {
		this.cmd01.addCmd.apply(this.cmd01, arguments);
	},
	addQObj : function (args) {
		this.cmd01.addQObj.apply(this.cmd01, arguments);
	},
	addMCmd : function (args) {
		this.cmd01.addMCmd.apply(this.cmd01, arguments);
	},
	exec : function (args) {
		this.cmd01.exec.apply(this.cmd01, arguments);
	},
	setTitle : function (args) {
		this.tlt01.setText.apply(this.tlt01,arguments);
	},
	setHeight : function (args) {
		this.cmd01.setHeight.apply(this.cmd01,arguments);
	}
};

extend(OverlayDisplay, EIGERCustomCmdPrompt);

function EIGERCmdInformation(parent, id, name, description, eUi) {
	OverlayDisplay.call(this, parent, id, name, description);
	this.eUi = eUi;
    
    this.qInstance = undefined;
    
    this.jElement.css('cursor','default');
    
    this.eUi.ui.resizer.resizeOffset(this.setOffset, this, 'top', ['mid',-200], 0);
    this.eUi.ui.resizer.resizeOffset(this.setOffset, this, 'left', ['mid',-400], 0);
	this.eUi.ui.resizer.trigger();
	
    this.tlt01 = this.addWidget(Title, []);
	this.tlt01.setLvl('h3');
    this.tlt01.setText('Command Information');
    
	this.addNewLine();
    
    this.lbl01 = this.addWidget(Label, []);
    this.lbl01.setText('Request URI');
    
    this.addNewLine();
	
    this.table = this.addWidget(Table,[]);
    this.table.setWidth('700px');
    
    this.tbr01 = this.table.addWidget(TableRow,[]);
    
    this.tbr01.tfd01 = this.tbr01.addWidget(TableField);
    this.tbr01.tfd01.setWidth('120px');
    this.tbr01.tlt02 = this.tbr01.tfd01.addWidget(Title,[]);
	this.tbr01.tlt02.setLvl('h3');
    this.tbr01.tlt02.setText('Request');
    
    this.tbr01.tfd02 = this.tbr01.addWidget(TableField);
    this.tbr01.tfd02.setWidth('230px');
    
    this.tbr01.tfd03 = this.tbr01.addWidget(TableField);
    this.tbr01.tfd03.setWidth('120px');
    this.tbr01.tlt03 = this.tbr01.tfd03.addWidget(Title,[]);
	this.tbr01.tlt03.setLvl('h3');
    this.tbr01.tlt03.setText('Response');
    
    this.tbr01.tfd04 = this.tbr01.addWidget(TableField);
    this.tbr01.tfd04.setWidth('230px');
    
    this.tbr02 = this.table.addWidget(TableRow,[]);
    
    this.tbr02.tfd01 = this.tbr02.addWidget(TableField);
    this.tbr02.tfd01.setText('Address');
    
    this.tbr02.tfd02 = this.tbr02.addWidget(TableField);
    this.tbr02.tfd02.setText('DCU_Addr');
    
    this.tbr02.tfd03 = this.tbr02.addWidget(TableField);
    this.tbr02.tfd03.setText('Code');
    
    this.tbr02.tfd04 = this.tbr02.addWidget(TableField);
    this.tbr02.tfd04.setText('RESPONSE_CODE');
    
    this.tbr03 = this.table.addWidget(TableRow,[]);
    
    this.tbr03.tfd01 = this.tbr03.addWidget(TableField);
    this.tbr03.tfd01.setText('Port');
    
    this.tbr03.tfd02 = this.tbr03.addWidget(TableField);
    this.tbr03.tfd02.setText('DCU_Port');
    
    this.tbr03.tfd03 = this.tbr03.addWidget(TableField);
    this.tbr03.tfd03.setText('Status');
    
    this.tbr03.tfd04 = this.tbr03.addWidget(TableField);
    this.tbr03.tfd04.setText('RESPONSE_Status');
    
    this.tbr04 = this.table.addWidget(TableRow,[]);
    
    this.tbr04.tfd01 = this.tbr04.addWidget(TableField);
    this.tbr04.tfd01.setText('Module');
    
    this.tbr04.tfd02 = this.tbr04.addWidget(TableField);
    this.tbr04.tfd02.setText('Module');
    
    this.tbr05 = this.table.addWidget(TableRow,[]);
    
    this.tbr05.tfd01 = this.tbr05.addWidget(TableField);
    this.tbr05.tfd01.setText('API Version');
    
    this.tbr05.tfd02 = this.tbr05.addWidget(TableField);
    this.tbr05.tfd02.setText('DCU_APIVER');
    
    this.tbr06 = this.table.addWidget(TableRow,[]);
    
    this.tbr06.tfd01 = this.tbr06.addWidget(TableField);
    this.tbr06.tfd01.setText('Task');
    
    this.tbr06.tfd02 = this.tbr06.addWidget(TableField);
    this.tbr06.tfd02.setText('Task');
    
    this.tbr07 = this.table.addWidget(TableRow,[]);
    
    this.tbr07.tfd01 = this.tbr07.addWidget(TableField);
    this.tbr07.tfd01.setText('Key');
    
    this.tbr07.tfd02 = this.tbr07.addWidget(TableField);
    this.tbr07.tfd02.setText('Key');
    
    this.tbr08 = this.table.addWidget(TableRow,[]);
    
    this.tbr08.tfd01 = this.tbr08.addWidget(TableField);
    this.tbr08.tfd01.setText('Payload');
    
    this.tbr08.tfd02 = this.tbr08.addWidget(TableField);
    this.tbr08.tfd02.setText('REQ_Value');
    
    this.tbr08.tfd03 = this.tbr08.addWidget(TableField);
    this.tbr08.tfd03.setText('Payload');
    
    this.tbr08.tfd04 = this.tbr08.addWidget(TableField);
    this.tbr08.tfd04.setText('RESPONSE_Payload');
    
    this.tbr09 = this.table.addWidget(TableRow,[]);
    
    this.tbr09.tfd01 = this.tbr09.addWidget(TableField);
    this.tbr09.tlt02 = this.tbr09.tfd01.addWidget(Title,[]);
	this.tbr09.tlt02.setLvl('h3');
    this.tbr09.tlt02.setText('Meta');
    
    this.tbr09.tfd02 = this.tbr09.addWidget(TableField);
    this.tbr09.tfd03 = this.tbr09.addWidget(TableField);
    this.tbr09.tfd04 = this.tbr09.addWidget(TableField);
    
    this.tbr10 = this.table.addWidget(TableRow,[]);
    
    this.tbr10.tfd01 = this.tbr10.addWidget(TableField);
    this.tbr10.tfd01.setText('Start Time');
    
    this.tbr10.tfd02 = this.tbr10.addWidget(TableField);
    this.tbr10.tfd02.setText('REQ_Time');
    
    this.tbr10.tfd03 = this.tbr10.addWidget(TableField);
    this.tbr10.tfd03.setText('Done Time');
    
    this.tbr10.tfd04 = this.tbr10.addWidget(TableField);
    this.tbr10.tfd04.setText('RESPONSE_Time');
    
    this.tbr11 = this.table.addWidget(TableRow,[]);
    
    this.tbr11.tfd01 = this.tbr11.addWidget(TableField);
    this.tbr11.tfd01.setText('Duration');
    
    this.tbr11.tfd02 = this.tbr11.addWidget(TableField);
    this.tbr11.tfd02.setText('REQ_Duration');
    
    this.addNewLine();

    this.btn01 = this.addWidget(Button, ['Update']);
    this.btn01.click(this.update, this)
    
    this.btn02 = this.addWidget(Button, ['Close']);
    this.btn02.click(this.remove, this)
    
    this.setClickClose(true);
}

EIGERCmdInformation.prototype = {
    close : function (event) {
        this.remove();
        //ToDo
    },
    setQ : function (qInstance) {
        this.qInstance = qInstance;
        if (this.qInstance.instance.versionInURI === true) {
			var url = sprintf('http://%s:%s/%s/api/%s/%s/%s',
				this.qInstance.instance.superDet.address, 
				this.qInstance.instance.superDet.port, 
				this.qInstance.instance.domain.index, 
				this.qInstance.instance.superDet.version, 
				this.qInstance.instance.subdomain.index, 
				this.qInstance.instance.index);
		} else {
			var url = sprintf('http://%s:%s/%s/api/%s/%s',
				this.qInstance.instance.superDet.address, 
				this.qInstance.instance.superDet.port, 
				this.qInstance.instance.domain.index, 
				this.qInstance.instance.subdomain.index, 
				this.qInstance.instance.index);
        }
        this.lbl01.setText(url);
        this.update();
    },
    update : function () {
        this.tbr02.tfd02.setText(this.qInstance.instance.superDet.address);
        this.tbr03.tfd02.setText(this.qInstance.instance.superDet.port);
        this.tbr04.tfd02.setText(this.qInstance.instance.domain.index);
        try {
            this.tbr05.tfd02.setText(this.qInstance.instance.domain.version.value.value);
        } catch (err) {
            this.tbr05.tfd02.setText('not yet available...');
        }
        this.tbr06.tfd02.setText(this.qInstance.instance.subdomain.index);
        this.tbr07.tfd02.setText(this.qInstance.instance.index);
        this.tbr08.tfd02.setText(this.qInstance.data);
        this.tbr08.tfd02.setTitle(this.qInstance.data);
        
        
        switch (this.qInstance.status) {
            case 0:
                this.tbr02.tfd04.setText('n/a');
                this.tbr03.tfd04.setText('Queued');
                this.tbr08.tfd04.setText('n/a');
                
                this.tbr10.tfd02.setText('n/a');
                this.tbr10.tfd04.setText('n/a');
                this.tbr11.tfd02.setText('n/a');
                break;
            case 1: 
                this.tbr02.tfd04.setText('n/a');
                this.tbr03.tfd04.setText('Sent');
                this.tbr08.tfd04.setText('n/a');
                
                this.tbr10.tfd02.setText(msToISO(this.qInstance.startTime));
                this.tbr10.tfd04.setText('n/a');
                this.tbr11.tfd02.setText('n/a');
                break;
            case 2:
                this.btn01.setDisabled(true);
                
                this.tbr02.tfd04.setText(this.qInstance.request.status);
                this.tbr03.tfd04.setText(this.qInstance.request.statusText);
                this.tbr08.tfd04.setText(this.qInstance.request.responseText);
                this.tbr08.tfd04.setTitle(this.qInstance.request.responseText);
                
                this.tbr10.tfd02.setText(msToISO(this.qInstance.startTime));
                this.tbr10.tfd04.setText(msToISO(this.qInstance.endTime));
                this.tbr11.tfd02.setText(sprintf('%s ms', this.qInstance.endTime-this.qInstance.startTime));
                break;
            default:
                this.btn01.setDisabled(true);
                try {
                    this.tbr02.tfd04.setText(this.qInstance.request.status);
                    this.tbr03.tfd04.setText(this.qInstance.request.statusText);
                    this.tbr03.tfd04.setTitle(this.qInstance.request.statusText);
                    this.tbr08.tfd04.setText(this.qInstance.request.responseText);
                    this.tbr08.tfd04.setTitle(this.qInstance.request.responseText);
                } catch (err) {
                    this.tbr02.tfd04.setText('n/a');
                    this.tbr03.tfd04.setText('error');
                    this.tbr08.tfd04.setText('n/a');
                }
                try {
                    this.tbr10.tfd02.setText(msToISO(this.qInstance.startTime));
                } catch (err) {
                    this.tbr10.tfd02.setText('n/a');
                }
                try {
                    this.tbr10.tfd04.setText(msToISO(this.qInstance.endTime));
                    this.tbr11.tfd02.setText(sprintf('%s ms', this.qInstance.endTime-this.qInstance.startTime));
                } catch (err) {
                    this.tbr10.tfd04.setText('n/a');
                    this.tbr11.tfd02.setText('n/a');
                }
                break;
        }
    },
	setTitle : function (args) {
		this.tlt01.setText.apply(this.tlt01,arguments);
	},
	setHeight : function (args) {
		this.cmd01.setHeight.apply(this.cmd01,arguments);
	}
};

extend(OverlayDisplay, EIGERCmdInformation);

function EIGERSubseqCmdPrompt(parent, id, name, description, eUi, callback) {
	OverlayDisplay.call(this, parent, id, name, description);
	this.eUi = eUi;
    
    this.closeDone = true;
    
    this.callback = callback;
    
	this.tlt01 = this.addWidget(Title, []);
	this.tlt01.setLvl('h3');
    
    this.eUi.ui.resizer.resizeOffset(this.setOffset, this, 'top', ['mid',-200], 0);
    this.eUi.ui.resizer.resizeOffset(this.setOffset, this, 'left', ['mid',-400], 0);
	this.eUi.ui.resizer.trigger();
    
	this.addNewLine();
	
	var cmdHeight = '30px';
	
	this.cmd01 = this.addWidget(
		EIGERSubseqCmdHandler, 
		[this.eUi, {'success' : [this._done, this, []],'error' : [this._fail, this, []]}]
		);
}

EIGERSubseqCmdPrompt.prototype = {
	addCmd : function (args) {
		this.cmd01.addCmd.apply(this.cmd01, arguments);
	},
	addQObj : function (args) {
		this.cmd01.addQObj.apply(this.cmd01, arguments);
	},
	addMCmd : function (args) {
		this.cmd01.addMCmd.apply(this.cmd01, arguments);
	},
	exec : function (args) {
		this.cmd01.exec.apply(this.cmd01, arguments);
	},
	setTitle : function (args) {
		this.tlt01.setText.apply(this.tlt01,arguments);
	},
	setHeight : function (args) {
		this.cmd01.setHeight.apply(this.cmd01,arguments);
	},
    _done : function (data) {
        this.callback['success'][0].apply(this.callback['success'][1],[data].concat(this.callback['success'][2]));
        if (this.closeDone) {
            this.remove();
        }
    },
    _fail : function (data) {
        this.callback['error'][0].apply(this.callback['error'][1],[data].concat(this.callback['error'][2]));
        if (this.closeDone) {
            this.remove();
        }
    }
};

extend(OverlayDisplay, EIGERSubseqCmdPrompt);

function EIGERSubseqCmdHandler (parent, id, name, description, eUi, callbackList) {
	BlockArea.call(this, parent, id, name, description);
	this.listOfQueues = [];
	
	this.callbackList = callbackList;
	
	this.eUi = eUi;
	
	this.status = 0;
	this.statusText = '';
	
	this.table = this.addWidget(Table,[]);
	this.table.setWidth('865px');
	
	this.btn01 = this.parent.addWidget(Button,['Cancel'])
	this.btn01.click(this.cancel, this);
	
	this.setHeight('400px');
	this.jElement.css('overflow-y','scroll');
	this.jElement.css('overflow-x','hidden');
	
	this.rows = {};
	
	this.eUi.addQueryStatusListener(this.updateQItem, this.newQItem, this);
	
	this.mQIter = 0;
	this.eIter = 0;
}

EIGERSubseqCmdHandler.prototype = {
	// execcute command immediately
	EXEC_IMMED : 0,
	EXEC_EXT : 1,
	EXEC_CLICK : 2,
	EXEC_ICLICK : 3,
	ENDING_COMMAND : true,
	NONENDING_COMMAND : false,
	addCmd : function(fObj, fOpts, execStyle, endingCommand) {
		if (execStyle === undefined) {
			execStyle = this.EXEC_IMMED;
		};
		this.addQObj(fObj.queueQuery.apply(fObj,fOpts), execStyle, endingCommand);
		
	},
	addQObj : function(qObj, execStyle, endingCommand) {
		this.listOfQueues.push({'qObject':qObj, 'execStyle': execStyle, 'endingCommand': endingCommand});
		this.newQItem(qObj);	
	},
	addMCmd : function(fObj, execStyle, endingCommand) {
		if (execStyle === undefined) {
			execStyle = this.EXEC_IMMED;
		};
		var tmpQ = new EIGERMQuery(this.eUi.eHandler, fObj, this, this.newMQItem, this.updateMQItem);
		tmpQ.setId(this.mQIter++);
		this.listOfQueues.push({'qObject':tmpQ, 'execStyle': execStyle, 'endingCommand': endingCommand});
		this.newMQItem(tmpQ);
	},
	cancel : function() {
		if (confirm('Do you really want to cancel current operation, this might cause invalid states. Press "ok" to cancel.')) {
			this.status = -2;
			this.end();
        }
	},
	exec: function() {
		var eIter = this.eIter++;
		if (this.listOfQueues[eIter] === undefined) {
			var completed = true;
			for (var el in  this.listOfQueues) {
				if (this.listOfQueues[el]['qObject'].status !== 2) {
					completed = false;
					break;
				}
			}
			if (completed) {
				this.end();
			}
		} else {
			if (this.listOfQueues[eIter]['qObject'].status === 0) {
				switch (this.listOfQueues[eIter]['execStyle']) {
					default:
					case this.EXEC_IMMED:
						this.listOfQueues[eIter]['qObject'].exec();
						break;
					case this.EXEC_CLICK:
					case this.EXEC_ICLICK:
						var id = this.listOfQueues[eIter]['qObject'].getId();
						this.rows[id].btn01.setDisabled(false);
						break;
				}
			} else {
				this.exec();
			}
		};
	},
	end : function() {
		this.eUi.removeQueryStatusListener(this);
		if ( this.status < 0 ) {
			console.log('Aborting Queue due to previous error.');
			for ( el in this.listOfQueues ) {
				this.listOfQueues[el]['qObject'].deleteQ();
			};
		};
		if ( this.status < 0 ) {
			this.callbackList['error'][0].apply(this.callbackList['error'][1],[this].concat(this.callbackList['error'][2]));
		} else {
			for (var el in  this.listOfQueues) {
				if (this.listOfQueues[el]['qObject'].status !== 2) {
					this.listOfQueues[el]['qObject'].deleteQ();
				}
			}
			this.callbackList['success'][0].apply(this.callbackList['success'][1],[this].concat(this.callbackList['success'][2]));
		}
		for (el in this.rows) {
			delete this.rows[el];
		};
	},
	updateQItem : function (qInstance) {
		var qListItem = this.checkQueued(qInstance);
		if (qListItem) {
			var id = qInstance.getId();
			if ( qInstance.status === 0 ) {
				this.rows[id].tfd03.ind01.setText('queued');
				this.rows[id].tfd03.ind01.grey();
			} else if  ( qInstance.status === 1 ) {
				if (this.status > -1 ) {
					this.status = 1;
				}
				this.rows[id].tfd03.ind01.setText('sent');
				this.rows[id].tfd03.ind01.warning();
				if (qListItem['execStyle'] === this.EXEC_CLICK || qListItem['execStyle'] === this.EXEC_ICLICK) {
					this.rows[id].btn01.remove();
				}
			} else if  ( qInstance.status === 2 ) {
				this.rows[id].tfd03.ind01.setText('sucess');
				this.rows[id].tfd03.ind01.ok();
				if ( qListItem['endingCommand'] === this.ENDING_COMMAND ) {
					this.end();
				} else {
					this.status = 2;
					this.exec();
				}
			} else if  ( qInstance.status < 0 && this.status >= 0) {
				this.statusText = qInstance.response.statusText;
				this.status = qInstance.status;
				
				this.rows[id].tfd03.ind01.setText('error');
				this.rows[id].tfd03.ind01.error();
				this.rows[id].tfd04.setText(this.statusText);
				this.rows[id].tfd04.setTitle(this.statusText);
				
				this.end();
			}
		}
	},
	newQItem : function (qInstance) {
		var qListItem = this.checkQueued(qInstance);
		if (qListItem) {
			var id = qInstance.getId();
		
			this.rows[id] = this.table.addWidget(EIGERTableRow, []);
		
			this.rows[id].tfd01.setText(id);
            var callee = this;
            this.rows[id].tfd01.click(function () {callee.showCmdInformation.apply(callee, [qInstance]) }, this);
			this.rows[id].tfd02.setText(qInstance.getText());
            this.rows[id].tfd02.click(function () {callee.showCmdInformation.apply(callee, [qInstance]) }, this);
			this.rows[id].tfd04.setText('');
			if (qListItem['execStyle'] === this.EXEC_CLICK || qListItem['execStyle'] === this.EXEC_ICLICK) {
				this.rows[id].btn01 = this.rows[id].tfd04.addWidget(Button, ['exec']);
				this.rows[id].btn01.click(qInstance.exec, qInstance);
				if (qListItem['execStyle'] === this.EXEC_CLICK) {
					this.rows[id].btn01.setDisabled(true);
				}
			}
			this.updateQItem(qInstance);
		}
	},
    showCmdInformation : function (qInstance) {
        var cmdInfo = new EIGERCmdInformation(this.eUi.ui.body, 0, 'EHC', 'EIGER Command Information', this.eUi)
        cmdInfo.setQ(qInstance);
    },
	updateMQItem : function (mQInstance) {
		var id = mQInstance.getId();
		if ( mQInstance.status === 0 ) {
			this.rows[id].tfd03.ind01.setText('queued');
			this.rows[id].tfd03.ind01.grey();
		} else if  ( mQInstance.status === 1 ) {
			if (this.status > -1 ) {
				this.status = 1;
			}
			this.rows[id].tfd03.ind01.setText(sprintf('%s/%s',mQInstance.getQDone(), mQInstance.getQCount()));
			this.rows[id].tfd02.prb01.setProgress(mQInstance.getProgress());
			this.rows[id].tfd03.ind01.warning();
		} else if  ( mQInstance.status === 2 ) {
			this.rows[id].tfd03.ind01.setText('sucess');
			this.rows[id].tfd03.ind01.ok();
			this.exec();
		} else if  ( mQInstance.status < 0  && this.status >= 0) {
			this.rows[id].tfd02.prb01.setProgress(mQInstance.getProgress());
			this.rows[id].tfd03.ind01.setText('error');
			this.rows[id].tfd03.ind01.error();
			this.rows[id].tfd04.setText('An error occured.');
			this.rows[id].tfd04.setTitle('An error occured.');
			this.status = mQInstance.status;
			this.end();
		}
	},
	newMQItem : function (mQInstance) {
		var id = mQInstance.getId();
		this.rows[id] = this.table.addWidget(EIGERTableMCRow, [mQInstance]);
		
		this.rows[id].tfd01.setText(mQInstance.getId());
		this.rows[id].tfd04.setText('');
		
		this.updateMQItem(mQInstance);
	},
	checkQueued : function (qInstance) {
		for (var el in this.listOfQueues) {
			if (this.listOfQueues[el]['qObject'] === qInstance) {
				return this.listOfQueues[el];
			}
		}
		return false;
	}
};


extend(BlockArea, EIGERDataLogger);
extend(BlockArea, EIGERCmdLogger);
extend(EIGERCmdLogger, EIGERCmdDisplay);
extend(EIGERCmdLogger, EIGERSubseqCmdHandler);

function EIGERTableRow(parent, id, name, description) {
	TableRow.call(this, parent, id, name, description);
	this.tfd01 = this.addWidget(TableField, []);
	this.tfd01.setText('ID');
	this.tfd01.setWidth('40px');
	this.tfd02 = this.addWidget(TableField, []);
	this.tfd02.setText('Path : Key');
	this.tfd02.setWidth('640px');
	this.tfd03 = this.addWidget(TableField, []);
	this.tfd03.setWidth('110px');
	this.tfd03.ind01 = this.tfd03.addWidget(Indicator, []);
	this.tfd03.ind01.setText('Status');
	this.tfd03.ind01.setWidth('100px');
	this.tfd04 = this.addWidget(TableField, []);
	this.tfd04.setText('Error');
	this.tfd04.setWidth('70px');
}

EIGERTableRow.prototype = {

};

function EIGERTableMCRow(parent, id, name, description) {
	EIGERTableRow.call(this, parent, id, name, description);
	this.tfd02.setText('');
	this.tfd02.prb01 = this.tfd02.addWidget(Progressbar,[]);
	this.tfd02.prb01.setProgress(0);
}

EIGERTableMCRow.prototype = {
	
};

function EIGERDataTableRow(parent, id, name, description) {
	EIGERTableRow.call(this, parent, id, name, description);
	this.tfd02.setWidth('590px');
	this.tfd03.setWidth('120px');
	this.tfd03.ind01.setWidth('80px');
	this.tfd04.setWidth('110px');
}

EIGERTableMCRow.prototype = {
	
};

extend(TableRow, EIGERTableRow);
extend(EIGERTableRow, EIGERTableMCRow);
extend(EIGERTableRow, EIGERDataTableRow);

var fu = 0;

// EIGER Ui Handler
function EIGERUiHandler(ui){
	this.ui = ui;
	
	this.fu = fu++;
	
	this.uiInstInt = 0;
	this.uiConnections = {};
	
    this.listOfSyncedKeys = [];
    
    this.eHandler = new EIGERHandler();
	this.e = new EIGER('','', this.eHandler);
	
	this.refInterval = 1000;
}

EIGERUiHandler.prototype = {
	_checkConnection : function (address, port, connect, init) {
		console.log(sprintf('Checking connection to %s:%s...', address, port));
		if (port == '') {
			port = 80;
		}
		if (address != '') {
			this.e.setHost(address,port);
		}
		
		var callback = {'success' : [this._checkConSuccess, this, [address, port, init]],'error' : [this._checkConError, this, []]};

		this.cmd01 = new EIGERSubseqCmdPrompt( this.ui.body, 0, 'EHC', 'EIGER Command Handler', this, callback);
		
		this.cmd01.setTitle(sprintf('Trying to connect to %s:%s', address, port));
		this.cmd01.setHeight('180px');
		
		this.cmd01.addCmd(this.e.detector.config.keys, ['GET','']);
		this.cmd01.addCmd(this.e.detector.status.keys, ['GET','']);
		this.cmd01.addCmd(this.e.filewriter.config.keys, ['GET','']);
		this.cmd01.addCmd(this.e.filewriter.status.keys, ['GET','']);
		this.cmd01.addCmd(this.e.monitor.config.keys, ['GET','']);
		this.cmd01.addCmd(this.e.monitor.status.keys, ['GET','']);		
	},
	_checkConSuccess : function (data, address, port, init) {
		var qTime = data.listOfQueues[1]['qObject'].endTime - data.listOfQueues[0]['qObject'].startTime;
		this.refInterval = (qTime+1000)*3;
		console.log(sprintf('Requests took %s ms to complete. Using %s ms as reference interval setting.', qTime, this.refInterval));
		this.cmd01 = '';
		this.e.unbind();
		this.e = new EIGER(address,port, this.eHandler);
		this.updateUiConnections();
		this._connect(address, port, init);
	},
	_checkConError : function(data) {
		this.cmd01 = '';
		alert(sprintf('%s\n\n%s','Failed to connect to detector.',data.statusText));
	},
	_connect : function(address, port, init) {
		var titleStr = sprintf('Connecting to %s:%s...', address, port);
		console.log(titleStr);
		if (init) {
			console.log(sprintf('Retrying after initalize...'));
		}
		
		if (init) {
			var callback = {'success' : [this.connectSuccess, this, []],'error' : [this.connectError, this, []]};
			cmdHeight = '70px';
		} else {
			var callback = {'success' : [this.connectSuccess, this, []],'error' : [this.connectErrorInit, this, [address, port, init]]};
			cmdHeight = '40px';
		}
		
		this.cmd01 = new EIGERSubseqCmdPrompt( this.ui.body, 0, 'EHC', 'EIGER Command Handler', this, callback);
		
		this.cmd01.setTitle(titleStr);
		this.cmd01.setHeight(cmdHeight);
		
		if (init === true) {
			this.cmd01.addCmd(this.e.detector.command.initialize, ['Put',  '', true]);
		}
		
		this.cmd01.addMCmd([this.e.update, [this.e, true]]);
		
		this.cmd01.exec();
	},
	connect : function(address, port, init) {
		if (port == '') {
			port = 80;
		}
		if (address != '') {
			this.e.setHost(address,port);
		}
		
		this._checkConnection(address, port, true, init);
	},
	connectSuccess : function(data) {
		this.cmd01 = '';
		this.setUpInterval();
		this.e.connectionStateID = 2;
		var acqView = this.getView('Acquire');
		this.switchView(acqView);
		this.ui.acq.disableAdvMode();
		this.ui.acq.chk04.setDisabled(false);
	},	
	connectError : function(data) {
		alert(sprintf('%s\n\n%s','Failed to connect to detector.',data.statusText));
		this.cmd01 = '';
	},
	connectErrorInit : function(data, address, port, init) {
		this.cmd01 = '';
		if (confirm('Could not connect to detector system.\n\nThis can be caused by the detector not being initialized. Would you like initializing the detector system and retry?')) {
			this._connect(address, port, true);
		}
	},
	getView : function(viewName) {
		for (var el in this.ui.viewList) {
			if (this.ui.viewList[el].name === viewName) {
				return this.ui.viewList[el];
			}
		}
		
	},
	switchView : function (view) {
		this.ui.activateView(view);
	},
	sync : function () {
		for (var el in this.uiConnections) {
			this.uiConnections[el].sync();
		};
	},
	setUpInterval : function() {
		for (var el in this.uiConnections) {
			this.uiConnections[el].setInterval();
		};
	},
	uiConnect : function(widget, eigerValue, interval, form) {
		var id = this.uiInstInt++;
		var tmp = new EIGERUiConnector(this, id, widget, eigerValue, interval, form);
		this.uiConnections[id] = tmp;
	},
	updateUiConnections : function() {
		for ( var index in this.uiConnections ) {
			var refreshList = this.uiConnections[index].eigerValue.refreshListeners;
			if (this.uiConnections[index].eigerValue instanceof EIGERKey) {
				this.uiConnections[index].eigerValue = this.e
													[this.uiConnections[index].eigerValue.domain.index]
													[this.uiConnections[index].eigerValue.subdomain.index]
													[this.uiConnections[index].eigerValue.index];
			} else {
				this.uiConnections[index].eigerValue = this.e
													[this.uiConnections[index].eigerValue.domain.index]
													[this.uiConnections[index].eigerValue.subdomain.index];
			}
			this.uiConnections[index].eigerValue.refreshListeners = refreshList;
		}
	},
	addQueryStatusListener : function (updateQItemCallback, newQItemCallback, widget) {
		this.eHandler.addQueueListener(widget, updateQItemCallback, newQItemCallback);
	},
	addQueryListenerList : function (list) {
		this.eHandler.addQueryListenerList(list);
	},
	getQueryStatusListeners : function () {
		return this.eHandler.getQueryStatusListeners();
	},
	removeQueryStatusListener : function (widget) {
		this.eHandler.removeQueueListener(widget);
	},
	removeAllQueryStatusListeners : function () {
		this.eHandler.removeAllQueryStatusListeners();
	}
};

// EIGER Ui Connectors
function EIGERUiConnector(eUi, id, widget, eigerValue, interval, form) {
	this.eUi = eUi;
	this.id = id;
	this.interval = interval;
    this.form = form;
    this.formAction = [];
	this.widget = widget;
	this.eigerValue = eigerValue;
	this.setUpWidgetListners(this);
	this.setDisabled(true);
	
};

EIGERUiConnector.prototype = {
	setId : function(id) {
		this.id = id;
	},
	setDisabled : function(value) {
		if ( typeof this.widget.setDisabled === 'function' ) {
			this.widget.setDisabled(value);
		}
	},
	sync : function() {
		switch (this.widget.type) {
			case 'Label':
			case '_Label':
				this.widget.setText(this.eigerValue.value.value);
				break;
			case 'Select':
				if ( this.widget.length === 0 ) {
					this.widget.addOptions(this.eigerValue.allowed_values.value);
				}
			case 'Input':
				this.widget.setValue(this.eigerValue.value.value);
				break;
			case 'Indicator': 
				this.widget.setText(this.eigerValue.value.value);
				// Possible States: na (not available), ready, initialize, configure, acquire, test, error
				if ($.inArray( this.eigerValue.value.value , this.eigerValue.critical_values.value.push('error') ) > -1) {
					this.widget.error();
				} else if ($.inArray( this.eigerValue.value.value , ["initialize","configure","acquire", "test"] ) > -1) {
					this.widget.warning();
				} else if ($.inArray( this.eigerValue.value.value , ["ready", "idle"] ) > -1) {
					this.widget.ok();
				} else {
					this.widget.grey();
				}
				break;
			default:
				this.widget.setValue(this.eigerValue.value.value);
				break;
		};		
	},	
	clearInterval : function() {
		window.clearInterval(this.iInst);
		for (var index in  this.eUi.listOfSyncedKeys) {
			if (this.eUi.listOfSyncedKeys[index][0] === this.eigerValue) {
				delete this.eUi.listOfSyncedKeys[index];
				break;
			}
		}
	},
	setInterval : function() {
		this.iInst = this.iFunction();
		this.setDisabled(false);
	},
	iFunction : function() {
		var callee = this;
		for (var index in  this.eUi.listOfSyncedKeys) {
			if (this.eUi.listOfSyncedKeys[index][0] === this.eigerValue) {
				var iIndex = index;
                break;
			}
		}
		if (iIndex === undefined) {
			var iVal = window.setInterval( function() {
				callee.eigerValue.update.apply(callee.eigerValue,[]);
			}, this.interval*this.eUi.refInterval );
			this.eUi.listOfSyncedKeys.push([this.eigerValue ,iVal]);
			return iVal;
		} else {
			return this.eUi.listOfSyncedKeys[iIndex][1];
		}
	},
	setUpWidgetListners : function() {
		var callee = this;
		this.eigerValue.refresh(this.sync,this);
		if ( this.widget.type === 'Label' || this.widget.type === '_Label') {
		} else if ( this.widget.type === 'Input') {
			this.widget.jInput.focus(function(){
				callee.clearInterval();
				callee.eUi.eHandler.abortAllKeyRequests(callee.eigerValue);
                if (callee.form !== undefined) {
                    callee.formAction = callee.form.getSubmit();
                    callee.form.clearSubmit();
                    callee.form.submit(callee.setValueSubmit, callee);
                }
			});
			this.widget.jInput.focusout(function(){
				callee.setValue.apply(callee,[]);
                callee.form.setSubmitListeners(callee.formAction);
			});
		} else if ( this.widget.type === 'CheckBox' || this.widget.type === 'Select') {
			this.widget.jInput.change(function(){
				callee.setValue.apply(callee,[]);
			});
		};
	},
    setValueSubmit : function() {
            this.setValue(true);
    },
	setValue : function(submit) {
		var changed = (this.widget.getValue() == this.eigerValue.value.value) ? false : true;
		if (changed) {
			console.log(sprintf('Changed %s to: %s (from: %s)',this.eigerValue.index, this.widget.getValue(), this.eigerValue.value.value));
				
			this.cmd01 = new EIGERSubseqCmdPrompt( this.eUi.ui.body, 0, 'EHC', 'EIGER Command Handler', this.eUi, {'success' : [this.putSuccess, this, [submit]],'error' : [this.putError, this, []]});
			
			this.cmd01.setTitle(sprintf('Updating value %s...', this.eigerValue.index));
			this.cmd01.setHeight('35px');
			
			this.cmd01.addQObj(this.eigerValue.setValue(this.widget.getValue()));
		} else {
			console.log(sprintf('Unchanged value %s (%s, from: %s)',this.eigerValue.index, this.widget.getValue(), this.eigerValue.value.value));
            if (submit) {
                this.reattachSubmit();
                this.form.submitted();
            }
		}
		this.setInterval();
	},
	getSuccess : function(data, submit) {
		this.cmd01 = '';
        if (submit) {
            this.reattachSubmit();
            this.form.submitted();
        }
	},
    reattachSubmit : function () {
        if (this.formAction.length > 0 && this.form !== undefined) {
            this.form.setSubmitListeners(this.formAction);
        }
    },
	putError : function(data) {
        alert(sprintf('Error while executing request.\n\n%s'), data.statusText);
		this.cmd01 = '';
        this.cmd01 = new EIGERSubseqCmdPrompt( this.eUi.ui.body, 0, 'EHC', 'EIGER Command Handler', this.eUi, {'success' : [this.error, this, []],'error' : [this.error, this, []]});

        this.cmd01.setTitle(sprintf('Recovering value %s...', this.eigerValue.index));
        this.cmd01.setHeight('35px');
        
        this.cmd01.addCmd(data.listOfQueues[0]['qObject'].instance, ['GET', '']);
	},
    error : function(data) {
		this.cmd01 = '';
        this.reattachSubmit();
    },
	putSuccess : function(data, submit) {
		this.cmd01 = '';
		var changedKeys = data.listOfQueues[0]['qObject'].response;
		var domain = data.listOfQueues[0]['qObject'].instance.domain.index;
		var subdomain = data.listOfQueues[0]['qObject'].instance.subdomain.index;
		
        if (!isNaN(Number(changedKeys.length)) && changedKeys.length > 0) {
            console.log(sprintf('Refreshing dependent keys %s:%s:%s...', domain, subdomain, changedKeys.join()));

            this.cmd01 = new EIGERSubseqCmdPrompt( this.eUi.ui.body, 0, 'EHC', 'EIGER Command Handler', this.eUi, {'success' : [this.getSuccess, this, [submit]],'error' : [this.error, this, []]});

            this.cmd01.setTitle(sprintf('Refreshing dependent keys (%s)...', this.eigerValue.index));

            var cmdHeight = sprintf('%spx',30*changedKeys.length);
            this.cmd01.setHeight(cmdHeight);

            for (var i = 0 ; i < changedKeys.length ; i++) {
                if ( !inExcludedKeys(changedKeys[i]) ) {
                    this.cmd01.addCmd(this.eUi.e[domain][subdomain][changedKeys[i]], ['GET', '']);
                }
            }
        }
	}
};

var clientVersion = '1.3.0T1';
var uniId = 0;

$( document ).ready(function() {
	var body = new BodyArea(uniId++);
	
	var resizer = new AreaResizer();
		
	var headerBannerArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	headerBannerArea.setWidth('900px')
	headerBannerArea.setHeight('223px')
	headerBannerArea.setOffset({top:'10', left:'10'})
	
	resizer.resizeOffset(headerBannerArea.setOffset, headerBannerArea, 'left', ['mid',-457], -7)
	
	var headerLogoArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	headerLogoArea.setWidth('173px')
	headerLogoArea.setHeight('40px')
	headerLogoArea.setOffset({top:'3', left:'30'})

	resizer.resizeOffset(headerLogoArea.setOffset, headerLogoArea, 'left', ['mid',-437], 13)
	
	var headerClaimArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	headerClaimArea.setWidth('440px')
	headerClaimArea.setHeight('40px')
	headerClaimArea.setOffset({top:'3', left:'470'})

	resizer.resizeOffset(headerClaimArea.setOffset, headerClaimArea, 'left', ['mid',3], 453)
	
	var headerArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	headerArea.setWidth('900px')
	headerArea.setHeight('270px')
	headerArea.setOffset({top:'0', left:'18'})
	headerArea.jElement.addClass('header-area');

	resizer.resizeOffset(headerArea.setOffset, headerArea, 'left', ['mid',-449], 1)
	
	var statusArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	statusArea.setWidth('130px');
	statusArea.setHeight('50px');
	statusArea.setOffset({top:'205', left:'780'});
	
	resizer.resizeOffset(statusArea.setOffset, statusArea, 'left', ['mid',317], 767)
	
	var navigationArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	navigationArea.setWidth('900px')
	navigationArea.setHeight('30px')
	navigationArea.setOffset({top:'235', left:'25'})
	
	resizer.resizeOffset(navigationArea.setOffset, navigationArea, 'left', ['mid',-442], 8)
	
	var footerArea01 = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	footerArea01.setWidth('300px')
	footerArea01.setHeight('100px')
	footerArea01.setOffset({top:'600', left:'600'})
	
	resizer.resizeOffset(footerArea01.setOffset, footerArea01, 'left', ['mid',133], 583)
	resizer.resizeOffset(footerArea01.setOffset, footerArea01, 'top', ['abs',-100], 390)
	
	var footerArea02 = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	footerArea02.setWidth('295px')
	footerArea02.setHeight('7px')
	footerArea02.setOffset({top:'800', left:'605'})
	footerArea02.getJElement().addClass('dectris-background');
	
	resizer.resizeOffset(footerArea02.setOffset, footerArea02, 'left', ['mid',138], 588)
	resizer.resizeOffset(footerArea02.setOffset, footerArea02, 'top', ['abs',-7], 390)
	
	var mainArea = new PlacementArea(body, uniId++, 'xx', 'xx'); 
	mainArea.jElement.addClass('main-area');
	mainArea.setWidth('900px')
	mainArea.setOffset({top:'290', left:'18'})
	
	resizer.resizeOffset(mainArea.setOffset, mainArea, 'left', ['mid',-449], 1)
	
	// Trigger Resizer to position elements
	resizer.trigger()
	
	// Header, Logo and Title
	var he01 = new BlockArea(headerBannerArea, uniId++, 'xx', 'xx')
	
	var he01_img01 = he01.addWidget(Image,[])
	he01_img01.setSrc('im/Banner_BRUENIG_WEBCLIENT.jpg')
	he01_img01.setWidth('900px');	
	
	var he02 = new BlockArea(headerLogoArea, uniId++, 'xx', 'xx')
	
	var he02_img01 = he02.addWidget(Image,[])
	he02_img01.setSrc('im/dectris_logo_1x.jpg')
	he02_img01.setWidth('173px');
	
	var he03 = new BlockArea(headerClaimArea, uniId++, 'xx', 'xx')
	
	var he03_img01 = he03.addWidget(Image,[])
	he03_img01.setSrc('im/dectris_claim.png')
	he03_img01.setWidth('440px');
	
	// footer, Logo and Address
	var fo01 = new BlockArea(footerArea01, uniId++, 'xx', 'xx')
	
	var fo01_lbl01 = fo01.addWidget(Label,[])
	fo01_lbl01.getJElement().addClass('dectris');
	fo01_lbl01.getJElement().html('<b>DECTRIS Ltd.</b><br>5400 Baden<br>Switzerland<br><b>www.dectris.com<b>');
	
	// Status Header
	var st01 = new BlockArea(statusArea, uniId++, 'xx', 'xx');
	
	// UI Handler
	var ui = new UiHandler(body, mainArea, nv01, resizer);
	var eUi = new EIGERUiHandler(ui);
	
	// Status Header Widget
	var st01_lbl01 = st01.addWidget(Label,[]);
	st01_lbl01.setText('No S/N Found');
	st01_lbl01.setWidth('100px');
	
	eUi.uiConnect(st01_lbl01, eUi.e.detector.config.detector_number, 10);
	
	st01.addNewLine();
	
	var st01_ind01 = st01.addWidget(Indicator,[]);
	st01_ind01.setText('Not Connected');
	st01_ind01.setWidth('120px');
	eUi.uiConnect(st01_ind01, eUi.e.detector.status.state, 1);

	
	// Navigation
	var nv01 = new BlockArea(navigationArea, 1, 'xx', 'xx');
	
	// Adding pages to main
	var pa01 = ui.addView(BlockArea, 'Settings', 'Detector Settings');
	var pa02 = ui.addView(BlockArea, 'Acquire', 'Aquisition Settings');
	var pa03 = ui.addView(BlockArea, 'Exposure', 'Exposure Information');
	var pa04 = ui.addView(BlockArea, 'Data', 'Data Information');
	var pa05 = ui.addView(BlockArea, 'Log', 'Logs and Information');
	var pa06 = ui.addView(BlockArea, 'Help & Support', 'Information about DECTRIS Ltd. support and help.');
	
	// Adding buttons for pages (navigation)
	var nv01_btn01 = ui.addNavButton(pa01, nv01);
	var nv01_btn02 = ui.addNavButton(pa02, nv01);
	var nv01_btn03 = ui.addNavButton(pa03, nv01);
	var nv01_btn04 = ui.addNavButton(pa04, nv01);
	var nv01_btn05 = ui.addNavButton(pa05, nv01);
	var nv01_btn06 = ui.addNavButton(pa06, nv01);
	
	// page1, connection settings
	var p01_con01 = pa01.addWidget(EIGERConSet,[ui, eUi]);
	var p02_acq01 = pa02.addWidget(EIGERAcqSet,[ui, eUi]);
	var p03_log01 = pa03.addWidget(EIGERAcq, [ui, eUi]);
	var p04_log01 = pa04.addWidget(EIGERData, [ui, eUi]);
	var p05_log01 = pa05.addWidget(EIGERLog, [ui, eUi]);
	var p06_log01 = pa06.addWidget(EIGERHelp, [ui, eUi]);

	// Main Area Footer
	
	var ma01 = new BlockArea(mainArea, uniId++, 'xx', 'xx');
	var ma01_lbl01 = ma01.addWidget(Label,[]);
	ma01_lbl01.getJElement().addClass('main-footer')
	ma01_lbl01.setText(sprintf('EIGER Quick Start Client, %s, Copyright: DECTRIS Ltd., Author: Andy Moesch',clientVersion))
});