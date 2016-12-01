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
        + dif + pad(tzo / 60);
        + ':' + pad(tzo % 60);
}

// Function for saving a data object as file
function saveFile(filename, dataBlob) {
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(dataBlob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        console.log(filename)
        elem.download = filename;    
        elem.href = window.URL.createObjectURL(dataBlob);
        document.body.appendChild(elem);
        elem.click();        
        document.body.removeChild(elem);
    }
}

function filterInt (value) {
  if(/^(\-|\+)?([0-9]+|Infinity)$/.test(value))
    return Number(value);
  return NaN;
}

function prettyJSON(json) {
    if (typeof json == 'string') {
        try { var jObj = JSON.parse(json); }
        catch (err) {return json;}
        json = JSON.stringify(jObj, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA&amp;'-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
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
	fadeIn : function(duration) {
		this.jElement.fadeIn(duration)
	},
	fadeOut : function(duration) {
		this.jElement.fadeOut(duration)
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
	removeClickListener: function (area) {
		$( area ).unbind( "click" );
	},
	click : function (action, thisArg) {
		return this.clickListeners.push([action, thisArg])-1;
	},
    unbindClick : function (listenerIndex) {
        return delete this.clickListeners[listenerIndex];
    },
	clicked: function(event){
		if (!this.disabled) {
			for (var index in this.clickListeners) {
				this.clickListeners[index][0].apply(this.clickListeners[index][1], [event]);
			}
		}
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
	removeHoverListeners: function (area) {
		$( area ).unbind( "mouseenter" );
		$( area ).unbind( "mouseleave" );
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

function ViewArea(parent, id, name, description) {
	BlockArea.call(this, parent, id, name, description);
    this.active = true;
}

ViewArea.prototype = {
    setVisibility : function (visibility) {
		if (visibility) {
			this.getJElement().show();
            this.active = true;
            this.activate();
		} else {
			this.getJElement().hide();
            if (this.active) {
                this.active = false;
                this.leave();
            }
		}
	},
    activate : function () {},
    leave : function () {}
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

function Pre(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'Pre'
	this.jPre = $('<pre/>').appendTo(this.jElement)
	this.jPre.appendTo(this.jElement)
}

Pre.prototype = {
    setWidth : function (value) {
		this.getJElement().width(value);
		var valueLength = value.length-2;
		var valueInt = value.substr(0,valueLength);
		this.jPre.width(sprintf('%spx',parseInt(valueInt)-25));
	},
    setHeight : function (value) {
		this.getJElement().height(value);
		var valueLength = value.length-2;
		var valueInt = value.substr(0,valueLength);
		this.jPre.height(sprintf('%spx',parseInt(valueInt)-30));
	},
    html : function (args) {
        this.jPre.html.apply(this.jPre,arguments);
    },
    empty : function (args) {
        this.jPre.empty.apply(this.jPre,arguments);
    }
};

function Input(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'Input';
	this.label = new _Label(this, this.id, this.name, this.description);
	this.nwl01 = this.addNewLine();
	this.jInput = $('<input>').prop(
		{
			type: 'Text'
		}
	).appendTo(this.jElement);
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
};

function FileInput(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'FileInput';
	this.label = new _Label(this, this.id, this.name, this.description);
	this.nwl01 = this.addNewLine();
	this.jInput = $('<input>').prop(
		{
			type: 'file'
		}
	).appendTo(this.jElement);
}

FileInput.prototype = {
    getFile : function() {
        return this.jInput.get(0).files[0]
    }
};

function CheckBox(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'CheckBox';
	this.label = new _Label(this, this.id, this.name, this.description);
	$('<br>').appendTo(this.jElement);
	this.jInput = $('<input type=\'checkbox\'>').appendTo(this.jElement);
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
		this.label.setText.apply(this.label,arguments);
	},
	getTitle : function(args) {
		this.label.getText.apply(this.label,arguments);
	}
};

function Select(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'Select';
	this.length = 0;
	this.label = new _Label(this, this.id, this.name, this.description);
	$('<br>').appendTo(this.jElement);
	this.jInput = $('<select></select>').appendTo(this.jElement);
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
};

function Extendable(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
    this.jElement.addClass('expandable');
    
    this.expanded = false;
    this.clickListeners = [];
    
    this.tlt01 = this.addWidget(Title,[]);
    this.tlt01.setLvl('h3');
    this.tlt01.setWidth('800px');
    
    this._img01 = this.addWidget(Image,[]);
	this._img01.setSrc('im/expand.png');
	this._img01.setWidth('12px');
    
    this.addNewLine();
    
    this.containerArea = this.addWidget(ContainerArea,[]);
    this.containerArea.setVisibility(false);
    
    this.addClickListener(this.tlt01.jElement, this.clicked);
    this.addClickListener(this._img01.jElement, this.clicked);
    this.click(this.toggle, this);
    
}

Extendable.prototype = {
    toggle : function() {
        if (this.expanded = !this.expanded) {
            this.containerArea.getJElement().slideDown(300);
            this._img01.setSrc('im/collapse.png');
        } else {
            this.containerArea.getJElement().slideUp(300);
            this._img01.setSrc('im/expand.png');
        }
        
    },
    addContent : function(args) {
        return this.containerArea.addWidget.apply(this.containerArea, arguments);
    },
    setTitle : function (args) {
        this.tlt01.setText.apply(this.tlt01,arguments)
    }
};

function _Label(parent, id, name, description) {
	WidgetArea.call(this, parent, id, name, description);
	this.type = '_Label';
	this.jElement.addClass('label');
	this.setWidth('200px');
	this.setHeight('18px');
}

_Label.prototype = {
	setText : function(value) {
		this.getJElement().text(value);
	},
	getText : function() {
		return this.getJElement().text();
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
		return this.label.getText.apply(this.label,arguments)
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

function SVGImage(parent, id, name, description) {
	ContainerArea.call(this, parent, id, name, description);
	this.type = 'Image'
	this.image = new _SVGImage(this, this.id, this.name, this.description)
}

SVGImage.prototype = {
	setWidth : function(args) {
		this.image.setWidth.apply(this.image,arguments)
	},
    setHeight : function(args) {
		this.image.setHeight.apply(this.image,arguments)
	},
    getSVG : function() {
        return this.image.svgImage;
    }
}

function _SVGImage(parent, id, name, description) {
	WidgetArea.call(this, parent, id, name, description);
	this.type = '_Image'
	this.jElement.addClass('image');
    this.svgImage = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.jImage = $(this.svgImage).appendTo(this.getJElement());
	this.jImage.addClass('imageDisp');
}

_SVGImage.prototype = {
	setWidth : function(value) {
        this.svgImage.setAttribute('width', value);
    },
	setHeight : function(value) {
        this.svgImage.setAttribute('height', value);
    },
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
	this.jElement.addClass('button');
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
    this.type = 'Button';
	if (typeof imagePath !== 'undefined'){
		this.image = $('<img class="buttonImage">').appendTo(this.jElement);
		this.image.attr("src", imagePath);
	}
	this.button = new _Button(this, uniId++, this.name, this.description)
	this.setText(text);
	this.clickListeners = [];
	this.addClickListener(this.button.getJElement(), this.clicked);
	this.disabled = false;
}

Button.prototype = {
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
	clickClose : function(event) {
		this.remove();
	},
	setClickClose : function(value) {
		if ( value ) {
			this.addClickListener(this.jElement, this.clickClose);
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
extend(BlockArea, ViewArea);
extend(Area, WidgetArea);
extend(Area, ContainerArea);
extend(Area, PlacementArea);
extend(Area, Progressbar);
extend(Area, Overlay);

extend(WidgetArea, _Button);
extend(WidgetArea, _Label);
extend(WidgetArea, _Title);
extend(WidgetArea, _SVGImage);
extend(WidgetArea, _Image);
extend(WidgetArea, _StatusIndicator);

extend(ContainerArea, Form);
extend(ContainerArea, Label);
extend(ContainerArea, CheckBox);
extend(ContainerArea, Extendable);
extend(ContainerArea, Title);
extend(ContainerArea, SVGImage);
extend(ContainerArea, Image);
extend(ContainerArea, Pre);
extend(ContainerArea, Input);
extend(Input, FileInput);
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
	click : function (action, thisArg) {
		return this.clickListeners.push([action, thisArg])-1;
	},
    unbindClick : function (listenerIndex) {
        return delete this.clickListeners[listenerIndex];
    },
	clicked: function(event){
		if (!this.disabled) {
			for (var index in this.clickListeners) {
				this.clickListeners[index][0].apply(this.clickListeners[index][1], [event]);
			}
		}
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
	},
	addNewLine : function() {
        var newLine = new LineBreak();
		newLine.getJElement().appendTo(this.jElement);
        return newLine;
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
	
	this.hiddenElements = [];
	this.hiddenNavigationHoverArea = null;
	this.hiddenNavigation = [];
	
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
	addHiddenHomeNavigation : function(widget) {
		this.hiddenNavigation.push(widget);
		widget.setVisibility(false);
	},	
	hideHomeNavigation : function() {
		for (var el in this.hiddenNavigation) {
			this.hiddenNavigation[el].getJElement().delay(2000).fadeOut(500);
		}
	},
	showHomeNavigation : function() {
		for (var el in this.hiddenNavigation) {
			this.hiddenNavigation[el].getJElement().fadeIn(200);
		}
	},
	enableHomeNavigationHover : function(area) {
		var callee = this;
		this.hiddenNavigationHoverArea = area;
		area.addHoverListener(
			area.getJElement(), 
			function(event) {
				callee.showHomeNavigation.apply(callee, []);
			}, 
			function(event) {
				callee.hideHomeNavigation.apply(callee, []);
			}
		);
	},
	addHiddenHomeWidget : function(widget) {
		this.hiddenElements.push(widget);
		widget.setVisibility(false);
	},
	hideHiddenHomeWidgets : function() {
		for (var el in this.hiddenElements) {
			this.hiddenElements[el].setVisibility(false)
		}
	},
	showHiddenHomeWidgets : function() {
		for (var el in this.hiddenElements) {
			this.hiddenElements[el].setVisibility(true)
		}
		for (var el in this.hiddenNavigation) {
			this.hiddenNavigation[el].setVisibility(true)
		}
		this.hiddenNavigationHoverArea.removeHoverListeners(this.hiddenNavigationHoverArea.getJElement());
	},
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
        return tmp;
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
				this.viewList[el].setVisibility(false);
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
    
    this.active = false;
    
	this.setInterval();
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
		if (this.interval > 0 && !this.active) {
			var callee = this;
            this.active = true;
			return window.setInterval( function() {
				callee.sync.apply(callee,[])
			}, this.interval );
		} else {
			this.sync();
            return this.iInst;
		}
	},
	setUpWidgetListners : function() {
		if ( this.widget.type === 'Label' || this.widget.type === '_Label') {
			
		} else if ( this.widget.type === 'Input') {
		
		};
	},
	clearInterval : function() {
		window.clearInterval(this.iInst);
        this.active = false;
	},
	setInterval : function() {
		this.iInst = this.iFunction();
	}
};
var clientVersion = '1.4.0T3';
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
	eUi.uiConnect(st01_ind01, eUi.e.detector.status.state, .2);
	ui.addHiddenHomeWidget(st01);
	
	// Navigation
	var nv01 = new BlockArea(navigationArea, 1, 'xx', 'xx');
	
	// Adding pages to main
	var pa01 = ui.addView(ViewArea, 'Home', 'Detector Settings');
	var pa02 = ui.addView(ViewArea, 'Acquire', 'Aquisition Settings');
	var pa03 = ui.addView(ViewArea, 'Exposure', 'Exposure Information');
	var pa04 = ui.addView(ViewArea, 'Data', 'Data Information');
	//var pa05 = ui.addView(ViewArea, 'Status', 'EIGER Status Information.');
	var pa06 = ui.addView(ViewArea, 'Log', 'Logs and Information');
	var pa07 = ui.addView(ViewArea, 'Help & Support', 'Information about DECTRIS Ltd. support and help.');
	
	// Adding buttons for pages (navigation)
	var nv01_btn01 = ui.addNavButton(pa01, nv01);
	var nv01_btn02 = ui.addNavButton(pa02, nv01);
	var nv01_btn03 = ui.addNavButton(pa03, nv01);
	var nv01_btn04 = ui.addNavButton(pa04, nv01);
	//var nv01_btn05 = ui.addNavButton(pa05, nv01);
	var nv01_btn06 = ui.addNavButton(pa06, nv01);
	var nv01_btn07 = ui.addNavButton(pa07, nv01);
	ui.addHiddenHomeNavigation(nv01_btn01);
	ui.addHiddenHomeWidget(nv01_btn02);
	ui.addHiddenHomeWidget(nv01_btn03);
	ui.addHiddenHomeWidget(nv01_btn04);
	ui.addHiddenHomeWidget(nv01_btn06);
	ui.addHiddenHomeNavigation(nv01_btn07);
	
	// page1, connection settings
	var p01_con01 = pa01.addWidget(EIGERConSet,[ui, eUi]);
	var p02_set01 = pa02.addWidget(EIGERAcqSet,[ui, eUi]);
	var p03_acq01 = pa03.addWidget(EIGERAcq, [ui, eUi]);
	var p04_dat01 = pa04.addWidget(EIGERData, [ui, eUi]);
	//var p05_sta01 = pa05.addWidget(EIGERStatus, [ui, eUi]);
	var p06_log01 = pa06.addWidget(EIGERLog, [ui, eUi]);
	var p07_hlp01 = pa07.addWidget(EIGERHelp, [ui, eUi]);
    
    //
    pa06.activate = function () {
        p06_log01.activateLog();
    }
    pa06.leave = function () {
        p06_log01.disableLog();
    }
    pa04.activate = function () {
        eUi.e.filewriter.files.update();
    }   

	// Main Area Footer
	
	var ma01 = new BlockArea(mainArea, uniId++, 'xx', 'xx');
	var ma01_lbl01 = ma01.addWidget(Label,[]);
	ma01_lbl01.getJElement().addClass('main-footer')
	ma01_lbl01.setText(sprintf('EIGER Quick Start Client, %s, Copyright: DECTRIS Ltd., Author: Andy Moesch',clientVersion))
	ui.addHiddenHomeWidget(ma01);
	
	// Hide Navigation Bar and Status Widget until connnected
	ui.enableHomeNavigationHover(navigationArea);
});
function EIGERStatus(parent, id, name, description, ui, eUi) {
	ContainerArea.call(this, parent, id, name, description);
	this.ui = ui;
	this.ui.sset = this;
	this.eUi = eUi;
	this.type = 'StatusWidget';
	this.ttl01 = this.addWidget(Title,[]);
	this.ttl01.setLvl('h2');
	this.ttl01.setText('EIGER Module Status');
	
	this.addNewLine();
	
    this.det = this.addWidget(SVGImage, []);
    this.det.setHeight(600);
    this.det.setWidth(800);
    
    this.btn01 = this.addWidget(Button,['show']);
    
	this.btn01.click(this.test, this);
    
    this.module1 = new EIGERSVGModule(this.det, 0, 'Module_00', 'Module 1234', 000, 000, .05);
    this.module2 = new EIGERSVGModule(this.det, 0, 'Module_00', 'Module 1234', 000, 130, .05);
    
    this.module3 = new EIGERSVGModule(this.det, 0, 'Module_00', 'Module 1234', 242, 14, .05);
    this.module4 = new EIGERSVGModule(this.det, 0, 'Module_00', 'Module 1234', 242, 144, .05);
}

EIGERStatus.prototype = {
    test : function () {
        console.log(this.module1);
        this.module1.rocs[0].setSVGPathsAttr('stroke', '#00ff00');  
    }
};

// Connection Settings Widget
function EIGERConSet(parent, id, name, description, ui, eUi) {
	ContainerArea.call(this, parent, id, name, description);
	this.ui = ui;
	this.ui.cset = this;
	this.eUi = eUi;
	this.type = 'ConnectionWidget';
	
	this.ttl01 = this.addWidget(Title,[])
	this.ttl01.setLvl('h2');
	this.ttl01.setText('Connect to your EIGER Detector');
	
	this.addNewLine();
	
	this.frm01 = this.addWidget(Form,[])
	
	this.inp01 = this.frm01.addWidget(Input,[]);
	this.inp01.setTitle('Address');
	this.inp01.setValue(document.domain);
	
	this.btn01 =  this.frm01.addWidget(Button,['...']);
	this.btn01.click(this.showAdvSetting, this)
	
	this.inp02 = this.frm01.addWidget(Input,[]);
	this.inp02.setTitle('Port');
	this.inp02.setValue('80');
	
	this.inp02.setVisibility(false);
	
	this.btn02 = this.frm01.addWidget(SubmitButton,['connect']);
	
	this.frm01.submit(this.connect, this);
}

EIGERConSet.prototype = {
	showAdvSetting: function(event) {
		this.btn01.setVisibility(false);
		this.inp02.setVisibility(true);
	},
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
    
 	this.btn04 = this.addWidget(Button,['Check State']);
	this.btn04.click(this.checkState, this);
	this.addAdvWidget(this.btn04);  
    
 	this.btn05 = this.addWidget(Button,['Custom Queue']);
	this.btn05.click(this.customQ, this);
	this.addAdvWidget(this.btn05);   
    
    this.addAdvWidget(this.addNewLine());
		
	this.ttl01 = this.addWidget(Title,[]);
	this.ttl01.setLvl('h4');
	this.ttl01.setText('Settings');

	this.frm01 = this.addWidget(Form,[]);
	
	this.inp01 = this.frm01.addWidget(Input,[]);
	this.inp01.setTitle('Photon Energy [eV]');
	this.addAdvWidget(this.inp01);
	
	this.inp02 = this.frm01.addWidget(Input,[]);
	this.inp02.setTitle('Threshold Energy [eV]');
	this.addAdvWidget(this.inp02);
	
	this.sel01 = this.frm01.addWidget(Select,[]);
	this.sel01.setTitle('Elements');
	
	this.frm01.addNewLine();
	
	this.inp03 = this.frm01.addWidget(Input,[]);
	this.inp03.setTitle('Count Time');
	
	this.inp04 = this.frm01.addWidget(Input,[]);
	this.inp04.setTitle('Frame Time');
	
	this.inp05 = this.frm01.addWidget(Input,[]);
	this.inp05.setTitle('Number of Images');

	this.frm01.addNewLine();	
	
	this.chk01 = this.frm01.addWidget(CheckBox,[]);
	this.chk01.setTitle('Apply Flatfield Correction');
	this.addAdvWidget(this.chk01);
	
	this.chk02 = this.frm01.addWidget(CheckBox,[]);
	this.chk02.setTitle('Apply Countrate Correction');
	this.addAdvWidget(this.chk02);

	
	this.addAdvWidget(this.frm01.addNewLine());	

	this.inp06 = this.frm01.addWidget(Input,[]);
	this.inp06.setTitle('Number of Triggers');
	this.addAdvWidget(this.inp06);	
    
	this.sel02 = this.frm01.addWidget(Select,[]);
	this.sel02.setTitle('Trigger Mode');
	this.addAdvWidget(this.sel02);	
	
	this.addAdvWidget(this.frm01.addNewLine());		
	
	this.inp07 = this.frm01.addWidget(Input,[]);
	this.inp07.setTitle('Name Pattern');
	this.addAdvWidget(this.inp07);	
    
	this.inp08 = this.frm01.addWidget(Input,[]);
	this.inp08.setTitle('NImages per Data File');
	this.addAdvWidget(this.inp08);	
	
	this.sel03 = this.frm01.addWidget(Select,[]);
	this.sel03.setTitle('FileWriter Mode');
	this.addAdvWidget(this.sel03);	
	
	this.frm01.addNewLine();	
	this.frm01.addNewLine();	
	
	this.chk04 = this.frm01.addWidget(CheckBox,[]);
	this.chk04.setTitle('Expert Mode');
	this.chk04.setDisabled(true);
    
 	this.chk05 = this.frm01.addWidget(CheckBox,[]);
	this.chk05.setTitle('Execute Commands Manually');
	this.addAdvWidget(this.chk05);	
	
	this.setAdvModeElVisibility(false);
	
	var callee = this;
	this.chk04.jInput.change(function(event){
			callee.toggleAdvanced.apply(callee,[]);
		});
	
	this.btn06 = this.frm01.addWidget(SubmitButton,['Acquire']);
    this.btn06.setDisabled(true);
	this.frm01.submit(this.acquire, this);
}

EIGERAcqSet.prototype = {
    connect : function() {
        this.eUi.uiConnect(this.inp01, this.eUi.e.detector.config.photon_energy, 1, this.frm01);
        this.eUi.uiConnect(this.inp02, this.eUi.e.detector.config.threshold_energy, 1, this.frm01);
        this.eUi.uiConnect(this.sel01, this.eUi.e.detector.config.element, 1, this.frm01);
        this.eUi.uiConnect(this.inp03, this.eUi.e.detector.config.count_time, 1, this.frm01);
        this.eUi.uiConnect(this.inp04, this.eUi.e.detector.config.frame_time, 1, this.frm01);
        this.eUi.uiConnect(this.inp05, this.eUi.e.detector.config.nimages, 1, this.frm01);
        this.eUi.uiConnect(this.chk01, this.eUi.e.detector.config.flatfield_correction_applied, 1, this.frm01);
        this.eUi.uiConnect(this.chk02, this.eUi.e.detector.config.countrate_correction_applied, 1, this.frm01);
        this.eUi.uiConnect(this.inp06, this.eUi.e.detector.config.ntrigger, 1, this.frm01);
        this.eUi.uiConnect(this.sel02, this.eUi.e.detector.config.trigger_mode, 1, this.frm01);
        this.eUi.uiConnect(this.inp07, this.eUi.e.filewriter.config.name_pattern, 1, this.frm01);
        this.eUi.uiConnect(this.inp08, this.eUi.e.filewriter.config.nimages_per_file, 1, this.frm01);
        this.eUi.uiConnect(this.sel03, this.eUi.e.filewriter.config.mode, 1, this.frm01);   
        
		this.eUi.setUpInterval();
        
        this.btn06.setDisabled(false);
    },
	acquire : function() {
        if (this.eUi.e.detector.status.state.value.value !== 'idle') {
            alert('Detector is not in idle state, will not start exposure.\n\nPlease disarm detector or abort exposure.')
        } else {
            if (!this.advMode) {		
                this.cmp01 = new EIGERSubseqCmdPrompt( this.ui.body, 0, 'EHC', 'EIGER Command Handler', this.eUi, {'success' : [this.expose, this, []],'error' : [function () {}, this, []]});
                this.cmp01.setTitle('Preparing standard user mode...');
        
                this.cmd01 = this.cmp01.addCmdLog();
                this.cmd01.setCmdHeight('180px');
		
                this.cmd01.addQObj(this.eUi.e.detector.config.ntrigger.setValue(1));
                this.cmd01.addQObj(this.eUi.e.detector.config.flatfield_correction_applied.setValue(true));
                this.cmd01.addQObj(this.eUi.e.detector.config.countrate_correction_applied.setValue(true));
                this.cmd01.addQObj(this.eUi.e.detector.config.trigger_mode.setValue('ints'));
                this.cmd01.addQObj(this.eUi.e.filewriter.config.mode.setValue('enabled'));
                this.cmd01.addQObj(this.eUi.e.filewriter.config.name_pattern.setValue(sprintf('BRUENIG_%s_$id', new Date().toISOString().slice(0, 10))));
            } else {
                new EIGERExp(this.ui, this.eUi, 'advExpose', this.chk05.getValue());
            }
        }
	},
    expose : function () {
        new EIGERExp(this.ui, this.eUi, 'expose');
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
		new EIGERConvenienceFunctions(this.ui, this.eUi, 'initialize');
	},
    disarm : function() {
        new EIGERConvenienceFunctions(this.ui, this.eUi, 'disarm');
    },
    abort : function() {
        new EIGERConvenienceFunctions(this.ui, this.eUi, 'abort');
    },
    checkState : function() {
        new EIGERConvenienceFunctions(this.ui, this.eUi, 'checkstate', true);
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

function EIGERConvenienceFunctions (ui, eUi, action) {
	this.ui = ui;
	this.eUi = eUi;  
    
    this.cmp01 = new EIGERSubseqCmdPrompt ( this.ui.body, 0, 'EHC', 'EIGER Command Handler', this.eUi, {'success' : [this.success, this, []],'error' : [this.error, this, []]} );
    this.cmp01.setCloseDone(false);
    this.cmd01 = this.cmp01.addCmdLog();
    
    
    switch (action) {
		case 'initialize' :
			this.cmd01.addCmd(this.eUi.e.detector.command.initialize, ['Put', '', true]);
            this.cmd01.setCmdHeight('35px');
            this.cmd01.exec();
			break;
		case 'disarm' :
			this.cmd01.addCmd(this.eUi.e.detector.command.disarm, ['Put', '', true]);
            this.cmd01.setCmdHeight('35px');
            this.cmd01.exec();
			break;
		case 'abort' :
			this.cmd01.addCmd(this.eUi.e.detector.command.abort, ['Put', '', true]);
            this.cmd01.setCmdHeight('35px');
            this.cmd01.exec();
            break;
		case 'checkstate' :
			this.cmp01.setTitle('Checking status and error keys of the detector...')
			if (!this.eUi.e.isVersionOrHigher(1,6,0)) {
				if (confirm('The detector will have to be reinitialized (JAUN Version 1.5.0 and older) in order to get the current state. Would you like to initialize the detector now?'))
				{
					this.cmd01.addCmd(this.eUi.e.detector.command.initialize, ['Put', '', true]); // Necessary work around JAUN
				} else {
					
				}
			} else {
				this.cmd01.addCmd(this.eUi.e.detector.command.status_update, ['Put', '', true])
			}
			this.cmd01.addCmd(this.eUi.e.detector.status.state, ['GET', '', true]);
			this.cmd01.addCmd(this.eUi.e.detector.status.error, ['Get', '', true]);
			this.cmd01.addCmd(this.eUi.e.filewriter.status.state, ['GET', '', true]);
			this.cmd01.addCmd(this.eUi.e.filewriter.status.error, ['GET', '', true]);
            var cmdHeight = 4;
            if (this.eUi.e.monitor) 
			{
				this.cmd01.addCmd(this.eUi.e.monitor.status.state, ['GET', '', true]); 
				this.cmd01.addCmd(this.eUi.e.monitor.status.error, ['GET', '', true]);
				cmdHeight += 2;
			}
            if (this.eUi.e.stream) {
				this.cmd01.addCmd(this.eUi.e.stream.status.state, ['GET', '', true]); 
				this.cmd01.addCmd(this.eUi.e.monitor.status.error, ['GET', '', true]);
				cmdHeight += 2;
			}
            this.cmd01.setCmdHeight(sprintf('%spx', cmdHeight*32));
            this.cmd01.exec();
            break;
    }
}

EIGERConvenienceFunctions.prototype = {
    success : function(args) {
        this._success.apply(this, arguments)
    },    
    error : function(args) {
        this._error.apply(this, arguments)
    },
	_success : function(data) {
	},
	_error : function(data) {	
	}    
}

function EIGERExp (ui, eUi, action, manualExec) {
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
            if (manualExec) {
                execStyle1 = this.cmd01.EXEC_CLICK;
                execStyle2 = this.cmd01.EXEC_ICLICK;
            } else {
                execStyle1 = this.cmd01.EXEC_IMMED;
                execStyle2 = this.cmd01.EXEC_IMMED;
            }
			var triggerMode = this.eUi.e.detector.config.trigger_mode.value.value;
			var nTriggers = this.eUi.e.detector.config.ntrigger.value.value;
			console.log(sprintf('Starting %s series with %s triggers...', triggerMode, nTriggers));
			this.cmd01.addCmd(this.eUi.e.detector.command.arm, ['Put', '', true]);
			if ( triggerMode.toLowerCase() === 'ints' ) {
				for (var i=0 ; i < nTriggers ; i++) {
					this.cmd01.addCmd(this.eUi.e.detector.command.trigger, ['Put', '', true], execStyle1);
				}
			} else if ( triggerMode.toLowerCase() === 'inte' ) {
				for (var i=0 ; i < nTriggers ; i++) {
					this.cmd01.addCmd(this.eUi.e.detector.command.trigger, ['Put', '', true], this.cmd01.EXEC_VCLICK);
				}
			}
			this.cmd01.addCmd(this.eUi.e.detector.command.disarm, ['Put', '', true],execStyle2 , this.cmd01.ENDING_COMMAND);
			this.endView = 'Data';
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
		this.cmd01.remove();
		dView = this.getView(this.endView);
		this.switchView(dView);
	},
	abortSuccess : function (data) {
		alert(sprintf('%s\n\n%s','Failed to execute an exposure.',data.statusText));
	
		this.switchView(this.getView('Acquire'));
	},
	error : function(data) {
		this.cmp01 = new EIGERSubseqCmdPrompt( this.ui.body, 0, 'EHC', 'EIGER Command Handler', this.eUi, {'success' : [this.abortSuccess, this, []],'error' : [function () {}, this, []]});
		this.cmp01.setTitle('Recovering detector state...');
        
        this.cmd01 = this.cmp01.addCmdLog();
		this.cmd01.setCmdHeight('35px');
		
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
    
    this.btn01 = this.addWidget(Button, ['refresh'])
    var callee = this;
    this.btn01.click( function() {
        callee.cmp01 = new EIGERSubseqCmdPrompt ( callee.ui.body, 0, 'EHC', 'EIGER Command Handler', callee.eUi, {'success' : [function() {}, callee, []],'error' : [function() {}, this, []]} );
        callee.cmp01.setCloseDone(true);
        callee.cmd01 = callee.cmp01.addCmdLog();
        callee.cmd01.addCmd(callee.eUi.e.filewriter.files, ['GET', '']);
        callee.cmd01.setCmdHeight('35px');
        callee.cmd01.exec();
    });
    
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
        
    this.chk01 = this.addWidget(CheckBox,[]);
    this.chk01.setTitle('Enable Command Log');
    this.chk01.jInput.change(function (event) {
        if (callee.chk01.getValue()) {
            callee.activateLog.apply(callee,[]);
        } else {
            callee.disableLog.apply(callee,[]);   
        }
    });
    
    this.lbl01 = this.addWidget(Label, []);
    
    
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
	this.uic01 = ui.uiConnect(this.ttl02.lbl02, function() { return Object.keys(callee.eUi.eHandler.activeQueries).length; }, 500);
	
	this.ttl02.lbl03 = this.addWidget(Label,[]);
	this.ttl02.lbl03.setText('History:');
	
	this.ttl02.lbl04 = this.addWidget(Label,[]);
	this.ttl02.lbl04.setText('n/a');
	this.ttl02.lbl04.setWidth('50px');
	this.uic02 = ui.uiConnect(this.ttl02.lbl04, function () { return callee.eUi.eHandler.history }, 500);
    
    this.addNewLine();
    
    this.ttl03 = this.addWidget(Title,[]);
	this.ttl03.setLvl('h4');
	this.ttl03.setText('Active Commands');
    
	this.addNewLine();
	
	this.lgh01 = this.addWidget(EIGERCmdLogger, [this.eUi]);
}

EIGERLog.prototype = {
    activateLog : function () {
        this.chk01.setValue(true);
        this.uic01.setInterval();
        this.uic02.setInterval();
        this.lgh01.activate();
        
        var callee = this;
        this.iInst = window.setTimeout( function() {
            callee.disableLog.apply(callee,[]);
        }, 60000);
        this.lbl01.getJElement().html('Please be aware that logging will automatically be disabled<br>after 60 seconds for performance consideratons.');
    },
    disableLog : function () {
        this.chk01.setValue(false);
        this.uic01.clearInterval();
        this.ttl02.lbl02.setText('n/a');
        this.uic02.clearInterval();
        this.ttl02.lbl04.setText('n/a');
        this.lgh01.disable();
        
        window.clearTimeout(this.iInst);
        this.lbl01.getJElement().html('');
    }
};

function EIGERHelp(parent, id, name, description, ui, eUi) {
	ContainerArea.call(this, parent, id, name, description);
	this.ui = ui;
	this.eUi = eUi;
	this.type = 'AcquireSettings';
	
	this.ttl01 = this.addWidget(Title,[]);
	this.ttl01.setLvl('h2');
	this.ttl01.setText('Support');
    
    this.addNewLine();
	
    this.ext01 = this.addWidget(Extendable,[]);
    this.ext01.setTitle('Support');
    
    this.ext01.toggle();
    
	this.ext01.containerArea.getJElement().append($ ('<p>We want to be your partner and find solutions for your needs. <br> \
								We can support you with our broad technical expertise and application know-how.<br><br> \
								Questions and inquiries - please contact us:<br><br> \
								E-mail<br> \
								<a href="mailto:support@dectris.com">support@dectris.com</a><br><br> \
								Homepage<br> \
								<a href="http://www.dectris.com" target="_blank">www.dectris.com</a><br><br> \
								Telephone<br> \
								+41 56 500 21 02</p> ') );
	
	this.addNewLine();
	
	this.ttl02 = this.addWidget(Title,[]);
	this.ttl02.setLvl('h2');
	this.ttl02.setText('Help');
	
	this.addNewLine();
    
    this.ext02 = this.addWidget(Extendable,[]);
    this.ext02.setTitle('Connect');
	
	this.ext02.img01 = this.ext02.addContent(Image,[]);
	this.ext02.img01.setSrc('im/help/Connect.jpeg');
	this.ext02.img01.setWidth('600px');	
	
	this.ext02.containerArea.getJElement().append($ ('<p>1. Please enter the detectors address (name or IP).<br>The port is configured to be 80 when the input is left empty <br> \
							2. Click on the connect button to set up the client.</p> ') );
	
    this.addNewLine();
    
    this.ext03 = this.addWidget(Extendable,[]);
    this.ext03.setTitle('Settings');
    
	this.ext03.img01 = this.ext03.addContent(Image,[]);
	this.ext03.img01.setSrc('im/help/Settings.jpeg');
	this.ext03.img01.setWidth('600px');	
	
	this.ext03.containerArea.getJElement().append($ ('<p>1. Please adapt the settings to your needs. <br> \
							2. Click on the acquire button to record a (series) of image(s).</p> ') );
    
	this.ext03.img01 = this.ext03.addContent(Image,[]);
	this.ext03.img01.setSrc('im/help/ExpertMode.jpeg');
	this.ext03.img01.setWidth('600px');	
	
	this.ext03.containerArea.getJElement().append($ ('<p>Advanced users might chose to use the advanced mode. Please only use this mode if you are an expert.</p> ') );	
	
    this.addNewLine();
    
    this.ext04 = this.addWidget(Extendable,[]);
    this.ext04.setTitle('Data Downloader');
                            
	this.ext04.img01 = this.ext04.addContent(Image,[]);
	this.ext04.img01.setSrc('im/help/Download.jpeg');
	this.ext04.img01.setWidth('600px');	
	
	this.ext04.containerArea.getJElement().append($ ('<p>1. By clicking the download button you will start downloading a file. <br>Always make sure to download the master and the data file.<br> \
							2. Clicking the "x" button will delete the resource on the DCU. You will be asked to confirm.</p> ') );	
    
}

EIGERHelp.prototype = {

};

extend(ContainerArea, EIGERStatus);
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
            this.updateQItem(id, 'deleted');
			$.ajax({
				url: sprintf('http://%s:%s/data/%s',
					this.eUi.e.address, 
					this.eUi.e.port, 
					this.rows[id].fileName
					),
				type: 'delete',
				contentType: "application/json",
				success: function(data) { 
					callee.updateQItem.apply(callee, [id, 'deleted']);
				},
				error: function(data) { 
					alert('Could not delete file.');
					callee.updateQItem.apply(callee, [id, 'new']);
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
}

EIGERCmdLogger.prototype = {
    activate : function () {
        this.eUi.addQueryStatusListener(this.updateQItem, this.newQItem, this);
        for (var el in this.eUi.eHandler.activeQueries) {
            this.newQItem(this.eUi.eHandler.activeQueries[el]);
        }
    },
    disable : function () {
        this.eUi.removeQueryStatusListener(this);
        for (var index in this.rows) {
        	this.rows[index].getJElement().remove();
            this.rows[index] = undefined;
            delete this.rows[index];
        }
        this.rows = [];
    },
	updateQItem : function (qInstance) {
		var id = qInstance.getId();
		var callee = this;
		
		if ( qInstance.status === 0 ) {
			this.rows[id].tfd03.ind01.setText(qInstance.progressText);
			this.rows[id].tfd03.ind01.grey();
		} else if  ( qInstance.status === 1 ) {
			this.rows[id].tfd03.ind01.setText(qInstance.progressText);
			this.rows[id].tfd03.ind01.warning();
		} else if  ( qInstance.status === 2 ) {
			this.rows[id].tfd03.ind01.setText(qInstance.progressText);
			this.rows[id].tfd03.ind01.ok();
			this.rows[id].getJElement().delay(500).slideUp(100, function() {
				callee.rows[id].getJElement().remove();
				callee.rows[id] = undefined;
				delete callee.rows[id];
			});
		} else if  ( qInstance.status < 0 ) {
			if (this.rows[id] !== undefined) {
				this.rows[id].tfd03.ind01.setText(qInstance.progressText);
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
    this.eUi.ui.resizer.resizeOffset(this.setOffset, this, 'left', ['mid',-445], 0);
	this.eUi.ui.resizer.trigger();
    
    this.tlt01.setText('Custom Command Queue Builder');
    
	this.addNewLine();
    
    var callee = this;
	
	this.ext01 = this.addWidget(Extendable,[]);
    this.ext01.setTitle('Add or Append to Queue from File');

	this.frm01 = this.ext01.addContent(Form, []);
    this.frm01.submit(this.append, this);
	
	this.fin01 = this.frm01.addWidget(FileInput,[])
    this.fin01.setTitle('Select file to upload...');
	
	this.btn01 = this.frm01.addWidget(SubmitButton, ['Append to Queue']);
	
    this.addNewLine();
    
	this.ext02 = this.addWidget(Extendable,[]);
    this.ext02.setTitle('Append to Queue manually');
	
	this.ext02.toggle()
	
    this.frm02 = this.ext02.addContent(Form, []);
    this.frm02.submit(this.submit, this);	
	
    this.sel01 = this.frm02.addWidget(Select,[]);
    this.sel01.setTitle('Method');
    this.sel01.setWidth('80px');
    this.sel01.addOptions(['GET','PUT','DELETE']);
    this.sel01.jInput.change(function (event) {
        callee.changeMethod.apply(callee, [event]);
    });
    
    this.sel02 = this.frm02.addWidget(Select,[]);
    this.sel02.setTitle('Module');
    this.sel02.setWidth('80px');
    this.addOptions(this.sel02,this.eUi.e.children);
    this.sel02.jInput.change(function (event) {
        callee.changeModule.apply(callee, [event]);
    });
    
    this.sel03 = this.frm02.addWidget(Select,[]);
    this.sel03.setTitle('Task');
    this.sel03.setWidth('87px');
    this.sel03.jInput.change(function (event) {
        callee.changeTask.apply(callee, [event]);
    });
    this.sel03.setDisabled(true);
    
    this.sel04 = this.frm02.addWidget(Select,[]);
    this.sel04.setTitle('Key');
    this.sel04.setWidth('247px');
    this.sel04.jInput.change(function (event) {
        callee.changeKey.apply(callee, [event]);
    });
    this.sel04.setDisabled(true);
    
    this.vaa01 = this.frm02.addWidget(ContainerArea,[]);
    this.vaa01.setWidth('150px');
    
    this.frm02.addNewLine();
    
    this.lbl01 = this.frm02.addWidget(Label,[]);
    this.lbl01.setWidth('500px');
    this.lbl01.setText(' ');
    
    this.chk01 = this.frm02.addWidget(CheckBox, []);
    this.chk01.setWidth('150px');
    this.chk01.setTitle('Execute manually');
    
    this.btn02 = this.frm02.addWidget(SubmitButton, ['Add To Queue'])
    this.btn02.setDisabled(true);
	
    this.addNewLine();
	
	this.cmd01 = this.addWidget(
		EIGERSubseqCmdHandler, 
		[this.eUi, {'success' : [this._done, this, []],'error' : [this._fail, this, []]}]
		);
    this.cmd01.setCmdHeight('100px');
    this.cmd01.btn01.setDisabled(true);
    
    this.addNewLine();
    
    this.chk02 = this.addWidget(CheckBox, []);
    this.chk02.setTitle('Close when finished');
    this.chk02.jInput.change( function () { callee.closeDone = callee.chk02.getValue() } );
    
    
    this.btn03 = this.addWidget(Button, ['Execute']);
    this.btn03.click(this.startQ, this);
    this.btn03.setDisabled(true);
	
	this.btn04 = this.addWidget(Button, ['Save Queue to file']);
    this.btn04.click(this.save, this);
    this.btn04.setDisabled(true);

    this.btn05 = this.addWidget(Button, ['Close']);
    this.btn05.click(this.close, this);
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
	append : function () {
		var reader = new FileReader();
		var callee = this;
		reader.onload = function(progressEvent){
			// Entire file
			callee.cmd01.importFromStr.apply(callee.cmd01,[this.result]);
		};
		reader.readAsText(this.fin01.getFile());
		this.btn03.setDisabled(false);
        this.btn04.setDisabled(false);
	},
    addValueField : function (key) {        
        var dataType = this.getDataType(key);
        try { var allowedValues = key.allowed_values.value; } catch(err) {};
        
        if (allowedValues !== undefined) {
            this.val01 = this.vaa01.addWidget(Select,[]);
            this.val01.setTitle('Value');
            this.val01.addOptions(allowedValues);
            this.val01.setValue(key.value.value);
        } else {
            switch (dataType) {
                case 'bool':
                    this.val01 = this.vaa01.addWidget(CheckBox,[]);
                    this.val01.setTitle('Value');
                    this.val01.setValue(key.value.value);
                    break;
                case 'int':
                case 'uint':
                case 'float':
                case 'string':
                    this.val01 = this.vaa01.addWidget(Input,[]);
                    this.val01.setTitle('Value');
                    this.val01.setValue(key.value.value);
                    break;
                case 'file':
                    this.val01 = this.vaa01.addWidget(FileInput,[])
                    this.val01.setTitle('Select file to upload...');
                    break;
                default:
                    break;
            }
        }
    },
    removeValueField : function () {
        this.vaa01.getJElement().empty();
    },
    getValue : function (key) {
        var dataType = this.getDataType(key);
        switch (dataType) {
            case 'command':
                var value = undefined;
                break;
            case 'bool':
                var value = this.val01.getValue();
                break;
            case 'int':
            case 'uint':
                var value = filterInt(this.val01.getValue());
                if (isNaN(value)) {
                    throw sprintf('Failed to cast \'%s\' to %s...', this.val01.getValue(), dataType);
                }
                break;
            case 'float':
                var value = parseFloat(this.val01.getValue());
                if (isNaN(value)) {
                    throw sprintf('Failed to cast \'%s\' to %s...', this.val01.getValue(), dataType);
                }
                break;
            case 'file':
                var value = this.val01.getFile();
                break;
            default:
                var value = this.val01.getValue();
        }
        return value;
    },
    changeModule : function (event) {
        this.removeValueField();
        this.enableAllModes();
        this.btn02.setDisabled(true);
        this.sel03.empty();
        this.sel03.setDisabled(false);
        this.sel04.empty();
        this.sel04.setDisabled(true);
        this.addOptions(this.sel03, this.eUi.e[this.sel02.getValue()].children);
    },
    changeTask : function (event) {
        this.removeValueField();
        this.enableAllModes();
        this.btn02.setDisabled(true);
        this.sel04.setDisabled(true);
        this.sel04.empty();
        if (this.eUi.e[this.sel02.getValue()][this.sel03.getValue()] instanceof EIGERSubDomain) {
            this.addOptions(this.sel04, this.eUi.e[this.sel02.getValue()][this.sel03.getValue()].children);   
            this.sel04.setDisabled(false);
        } else if (this.eUi.e[this.sel02.getValue()][this.sel03.getValue()] instanceof EIGERSpecialKey) {
            this.enableMode(this.eUi.e[this.sel02.getValue()][this.sel03.getValue()].access_mode.value);
            this.sel04.setDisabled(true);
            this.btn02.setDisabled(false);
        }
    },
    changeKey : function (event) {
        this.removeValueField();
        try {
            var key = this.eUi.e[this.sel02.getValue()][this.sel03.getValue()][this.sel04.getValue()];
            this.enableMode(key.access_mode.value);
            switch(this.sel01.getValue()) {
                case 'PUT':
                    this.addValueField(key);
                    break;
                case 'GET':
                default:
                    this.removeValueField();
                    break;
            }
            this.btn02.setDisabled(false);
        } catch (err) {
            console.log(err);
        }
    },
    changeMethod : function (event) {
        this.changeKey();
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
                    callee.changeMethod.apply(callee,[]);
                });
            }
        });
    },
	save : function () {
		var data = new Blob([this.cmd01.exportAsStr()], {type: 'application/json'});
		saveFile(sprintf('BRUENIG_%s.json',new Date().toISOString().slice(0, 10)), data)
	},
    startQ : function () {
        this.btn03.setVisibility(false);
        this.ext01.setVisibility(false);
        this.ext02.setVisibility(false);
        this.cmd01.btn01.setDisabled(false);
        this.cmd01.exec();
    },
    submit : function (args) {
		var subdomain = this.eUi.e[this.sel02.getValue()][this.sel03.getValue()];
		var key = (subdomain instanceof EIGERSpecialKey) ? subdomain : subdomain[this.sel04.getValue()];
		if (this.sel01.getValue() === 'PUT') {
			this.addQObjByNames(this.sel02.getValue(), this.sel03.getValue(), this.sel04.getValue(), this.sel01.getValue(),  this.getValue(key), this.chk01.getValue());
        } else {
			this.addQObjByNames(this.sel02.getValue(), this.sel03.getValue(), this.sel04.getValue(), this.sel01.getValue(),  undefined, this.chk01.getValue());	
		}
		this.btn03.setDisabled(false);
        this.btn04.setDisabled(false);
    },
	addCmd : function (args) {
		return(this.cmd01.addCmd.apply(this.cmd01, arguments));
	},
	addQObj : function (args) {
		return(this.cmd01.addQObj.apply(this.cmd01, arguments));
	},
	addQObjByNames : function (args) {
		return(this.cmd01.addQObjByNames.apply(this.cmd01, arguments));
	},
	addMCmd : function (args) {
		return(this.cmd01.addMCmd.apply(this.cmd01, arguments));
	},
	getDataType : function (args) {
		return(this.cmd01.getDataType.apply(this.cmd01, arguments));
	},
	setTitle : function (args) {
		return(this.tlt01.setText.apply(this.tlt01,arguments));
	},
	setCmdHeight : function (args) {
		return(this.cmd01.setCmdHeight.apply(this.cmd01,arguments));
	}
};

extend(OverlayDisplay, EIGERCustomCmdPrompt);

function EIGERCmdInformation(parent, id, name, description, eUi) {
	OverlayDisplay.call(this, parent, id, name, description);
	this.eUi = eUi;
    
    this.qInstance = undefined;
    
    this.reqPayload = false;
    this.resPayload = false;
    
    var callee = this;
    
    this.jElement.css('cursor','default');
    this.jElement.css('max-height','600px');
    this.jElement.css('overflow-y','scroll');
    this.jElement.css('overflow-x','hidden');
    
    this.addClickListener(this.getJElement(), function () {});
    
    this.eUi.ui.resizer.resizeOffset(this.setOffset, this, 'top', ['mid',-300], 0);
    this.eUi.ui.resizer.resizeOffset(this.setOffset, this, 'left', ['mid',-445], 0);
	this.eUi.ui.resizer.trigger();
    
    this.img01 = this.addWidget(Image,[]);
	this.img01.setSrc('im/wait.gif');
	this.img01.setWidth('24px');
    this.img01.getJElement().css('vertical-align','top');
	
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
    this.tbr02.setHeight('22px');
    
    this.tbr02.tfd01 = this.tbr02.addWidget(TableField);
    this.tbr02.tfd01.setText('Address');
    
    this.tbr02.tfd02 = this.tbr02.addWidget(TableField);
    this.tbr02.tfd02.setText('DCU_Addr');
    
    this.tbr02.tfd03 = this.tbr02.addWidget(TableField);
    this.tbr02.tfd03.setText('Code');
    
    this.tbr02.tfd04 = this.tbr02.addWidget(TableField);
    this.tbr02.tfd04.setText('RESPONSE_CODE');
    
    this.tbr03 = this.table.addWidget(TableRow,[]);
    this.tbr03.setHeight('22px');
    
    this.tbr03.tfd01 = this.tbr03.addWidget(TableField);
    this.tbr03.tfd01.setText('Port');
    
    this.tbr03.tfd02 = this.tbr03.addWidget(TableField);
    this.tbr03.tfd02.setText('DCU_Port');
    
    this.tbr03.tfd03 = this.tbr03.addWidget(TableField);
    this.tbr03.tfd03.setText('Status');
    
    this.tbr03.tfd04 = this.tbr03.addWidget(TableField);
    this.tbr03.tfd04.setText('RESPONSE_Status');
    
    this.tbr04 = this.table.addWidget(TableRow,[]);
    this.tbr04.setHeight('22px');
    
    this.tbr04.tfd01 = this.tbr04.addWidget(TableField);
    this.tbr04.tfd01.setText('Module');
    
    this.tbr04.tfd02 = this.tbr04.addWidget(TableField);
    this.tbr04.tfd02.setText('Module');
    
    this.tbr05 = this.table.addWidget(TableRow,[]);
    this.tbr05.setHeight('22px');
    
    this.tbr05.tfd01 = this.tbr05.addWidget(TableField);
    this.tbr05.tfd01.setText('API Version');
    
    this.tbr05.tfd02 = this.tbr05.addWidget(TableField);
    this.tbr05.tfd02.setText('DCU_APIVER');
    
    this.tbr06 = this.table.addWidget(TableRow,[]);
    this.tbr06.setHeight('22px');
    
    this.tbr06.tfd01 = this.tbr06.addWidget(TableField);
    this.tbr06.tfd01.setText('Task');
    
    this.tbr06.tfd02 = this.tbr06.addWidget(TableField);
    this.tbr06.tfd02.setText('Task');
    
    this.tbr07 = this.table.addWidget(TableRow,[]);
    this.tbr07.setHeight('22px');
    
    this.tbr07.tfd01 = this.tbr07.addWidget(TableField);
    this.tbr07.tfd01.setText('Key');
    
    this.tbr07.tfd02 = this.tbr07.addWidget(TableField);
    this.tbr07.tfd02.setText('Key');
    
    this.tbr08 = this.table.addWidget(TableRow,[]);
    this.tbr08.tfd01 = this.tbr08.addWidget(TableField);
    this.tbr08.tfd01.setText('Payload');
    
    this.tbr08.tfd02 = this.tbr08.addWidget(TableField);
    this.tbr08.tfd02.lbl01 = this.tbr08.tfd02.addWidget(Label, []);
    this.tbr08.tfd02.lbl01.setWidth('210px');
    this.tbr08.tfd02.lbl01.getJElement().css('overflow-x','hidden');
    this.tbr08.tfd02.lbl01.getJElement().css('overflow-y','hidden');
    this.tbr08.tfd02.lbl01.getJElement().css('vertical-align','top');
    this.tbr08.tfd02.lbl01.setText('RESPONSE_Payload');
    this.tbr08.tfd02.img01 = this.tbr08.tfd02.addWidget(Image, []);
    this.tbr08.tfd02.img01.getJElement().css('vertical-align','top');
	this.tbr08.tfd02.img01.setSrc('im/expand.png');
	this.tbr08.tfd02.img01.setWidth('12px');
    this.tbr08.tfd02.click(function () {
        callee.toggleReqPayload.apply(callee,[]);
    });	
    
    
    this.tbr08.tfd03 = this.tbr08.addWidget(TableField);
    this.tbr08.tfd03.setText('Payload');
    
    this.tbr08.tfd04 = this.tbr08.addWidget(TableField);
    this.tbr08.tfd04.lbl01 = this.tbr08.tfd04.addWidget(Label, []);
    this.tbr08.tfd04.lbl01.setWidth('210px');
    this.tbr08.tfd04.lbl01.getJElement().css('overflow-x','hidden');
    this.tbr08.tfd04.lbl01.getJElement().css('overflow-y','hidden');
    this.tbr08.tfd04.lbl01.getJElement().css('vertical-align','top');
    this.tbr08.tfd04.lbl01.setText('RESPONSE_Payload');
    this.tbr08.tfd04.img01 = this.tbr08.tfd04.addWidget(Image, []);
    this.tbr08.tfd04.img01.getJElement().css('vertical-align','top');
	this.tbr08.tfd04.img01.setSrc('im/expand.png');
	this.tbr08.tfd04.img01.setWidth('12px');
    this.tbr08.tfd04.click(function () {
        callee.toggleResPayload.apply(callee,[]);
    });
    
    this.pre01 = this.addWidget(Pre,[]);
    //this.pre01.getJElement().css('overflow-y','scroll');
    this.pre01.setWidth('700px');
    //this.pre01.getJElement().css('max-height','200px');
    //this.pre01.setVisibility(false);
    this.pre01.addClickListener(this.pre01.getJElement(),function () {});
    
    this.tbl02 = this.addWidget(Table,[]);
    this.tbl02.setWidth('700px');
    
    this.tbr09 = this.tbl02.addWidget(TableRow,[]);
    
    this.tbr09.tfd01 = this.tbr09.addWidget(TableField);
    this.tbr09.tfd01.setWidth('120px');
    this.tbr09.tlt02 = this.tbr09.tfd01.addWidget(Title,[]);
	this.tbr09.tlt02.setLvl('h3');
    this.tbr09.tlt02.setText('Meta');
    
    this.tbr09.tfd02 = this.tbr09.addWidget(TableField);
    this.tbr09.tfd02.setWidth('230px');
    this.tbr09.tfd03 = this.tbr09.addWidget(TableField);
    this.tbr09.tfd03.setWidth('120px');
    this.tbr09.tfd04 = this.tbr09.addWidget(TableField);
    this.tbr09.tfd04.setWidth('230px');
    
    this.tbr10 = this.tbl02.addWidget(TableRow,[]);
    
    this.tbr10.tfd01 = this.tbr10.addWidget(TableField);
    this.tbr10.tfd01.setText('Start Time');
    
    this.tbr10.tfd02 = this.tbr10.addWidget(TableField);
    this.tbr10.tfd02.setText('REQ_Time');
    
    this.tbr10.tfd03 = this.tbr10.addWidget(TableField);
    this.tbr10.tfd03.setText('Done Time');
    
    this.tbr10.tfd04 = this.tbr10.addWidget(TableField);
    this.tbr10.tfd04.setText('RESPONSE_Time');
    
    this.tbr11 = this.tbl02.addWidget(TableRow,[]);
    
    this.tbr11.tfd01 = this.tbr11.addWidget(TableField);
    this.tbr11.tfd01.setText('Duration');
    
    this.tbr11.tfd02 = this.tbr11.addWidget(TableField);
    this.tbr11.tfd02.setText('REQ_Duration');
    
    this.addNewLine();

    this.chk01 = this.addWidget(CheckBox, []);
    this.chk01.setTitle('Update automatically');
    this.enableAutoUpdate();
    this.chk01.getJElement().change( function () {
        if (callee.chk01.getValue()) {
            callee.enableAutoUpdate.apply(callee,[]);  
        } else {
            callee.disableAutoUpdate.apply(callee,[]);  
        } 
    });
    
    this.btn01 = this.addWidget(Button, ['Close']);
    this.btn01.click(this.remove, this);
    
    this.setClickClose(true);
}

EIGERCmdInformation.prototype = {
    enableAutoUpdate : function () {
        this.chk01.setValue(true);
        this.eUi.addQueryStatusListener(this.updateQItem, this.newQItem, this);
    },
    disableAutoUpdate : function () {
        this.chk01.setValue(false);
        this.eUi.removeQueryStatusListener(this);
    },
    updateQItem : function (qInstance) {
        if (this.qInstance === qInstance) {
            this.update();
        }
    },
    newQItem : function () {
        
    },
    close : function (event) {
        this.remove();
        //ToDo
    },
    toggleReqPayload : function () {
        if (this.reqPayload) {
            this.tbr08.tfd02.img01.setSrc('im/expand.png');
            this.tbr08.tfd02.getJElement().css('border-bottom','0px');
            this.pre01.getJElement().slideUp(300);
        } else {
            if (this.resPayload) {
                this.tbr08.tfd04.img01.setSrc('im/expand.png');
                this.tbr08.tfd04.getJElement().css('border-bottom','0px');
                this.resPayload = !this.resPayload;
            }
            this.tbr08.tfd02.img01.setSrc('im/collapse.png');
            this.tbr08.tfd02.getJElement().css('border-bottom','1px solid white');
            var text = this.tbr08.tfd02.lbl01.getText();
            if (text === '') {
                this.pre01.html('not available');
            } else {
                this.pre01.html(prettyJSON(text));
            }
            this.pre01.getJElement().slideDown(300);
        }
        this.reqPayload = !this.reqPayload;
    },
    toggleResPayload : function () {
        if (this.resPayload) {
            this.tbr08.tfd04.img01.setSrc('im/expand.png');
            this.tbr08.tfd04.getJElement().css('border-bottom','0px');
            this.pre01.getJElement().slideUp(300);
        } else {
            if (this.reqPayload) {
                this.tbr08.tfd02.img01.setSrc('im/expand.png');
                this.tbr08.tfd02.getJElement().css('border-bottom','0px');
                this.reqPayload = !this.reqPayload;
            }
            this.tbr08.tfd04.img01.setSrc('im/collapse.png');
            this.tbr08.tfd04.getJElement().css('border-bottom','1px solid white');
            var text = this.tbr08.tfd04.lbl01.getText();
            if (text === '' || text === 'n/a') {
                this.pre01.html('not available');
            } else {
                this.pre01.html(prettyJSON(text));
            }
            this.pre01.getJElement().slideDown(300);
        }
        this.resPayload = !this.resPayload;
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
        this.lbl01.setText(sprintf('[%s] %s', qInstance.method.toUpperCase(), url));
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
        this.tbr08.tfd02.lbl01.setText(this.qInstance.data);
        this.tbr08.tfd02.setTitle(this.qInstance.data);
        
        
        switch (this.qInstance.status) {
            case 0:
                this.tbr02.tfd04.setText('n/a');
                this.tbr03.tfd04.setText('Queued');
                this.tbr08.tfd04.lbl01.setText('n/a');
                
                this.tbr10.tfd02.setText('n/a');
                this.tbr10.tfd04.setText('n/a');
                this.tbr11.tfd02.setText('n/a');
                break;
            case 1: 
                this.tbr02.tfd04.setText('n/a');
                this.tbr03.tfd04.setText('Sent');
                this.tbr08.tfd04.lbl01.setText('n/a');
                
                this.tbr10.tfd02.setText(msToISO(this.qInstance.startTime));
                this.tbr10.tfd04.setText('n/a');
                this.tbr11.tfd02.setText('n/a');
                break;
            case 2:
                this.disableAutoUpdate();
                this.img01.remove();
                this.chk01.setDisabled(true);
                
                this.tbr02.tfd04.setText(this.qInstance.request.status);
                this.tbr03.tfd04.setText(this.qInstance.request.statusText);
                this.tbr08.tfd04.lbl01.setText(JSON.stringify(this.qInstance.request.response));
                this.tbr08.tfd04.setTitle(JSON.stringify(this.qInstance.request.response));
                
                this.tbr10.tfd02.setText(msToISO(this.qInstance.startTime));
                this.tbr10.tfd04.setText(msToISO(this.qInstance.endTime));
                this.tbr11.tfd02.setText(sprintf('%s ms', this.qInstance.endTime-this.qInstance.startTime));
                break;
            default:
                this.disableAutoUpdate();
                this.img01.remove();
                this.chk01.setDisabled(true);
                 
                try {
                    this.tbr02.tfd04.setText(this.qInstance.request.status);
                    this.tbr03.tfd04.setText(this.qInstance.request.statusText);
                    this.tbr03.tfd04.setTitle(this.qInstance.request.statusText);
                    this.tbr08.tfd04.lbl01.setText(JSON.stringify(this.qInstance.request.response));
                    this.tbr08.tfd04.setTitle(JSON.stringify(this.qInstance.request.response));
                } catch (err) {
                    this.tbr02.tfd04.setText('n/a');
                    this.tbr03.tfd04.setText('error');
                    this.tbr08.tfd04.lbl01.setText('n/a');
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
		return(this.tlt01.setText.apply(this.tlt01,arguments));
	}
};

extend(OverlayDisplay, EIGERCmdInformation);

function EIGERSubseqCmdPrompt(parent, id, name, description, eUi, callback) {
	OverlayDisplay.call(this, parent, id, name, description);
	this.eUi = eUi;
    
    this.closeDone = true;
    
    this.callback = callback;
     
    this.img01 = this.addWidget(Image,[]);
	this.img01.setSrc('im/wait.gif');
	this.img01.setWidth('24px');
    this.img01.getJElement().css('vertical-align','top');
    
	this.tlt01 = this.addWidget(Title, []);
	this.tlt01.setLvl('h3');
    
    this.eUi.ui.resizer.resizeOffset(this.setOffset, this, 'top', ['mid',-200], 0);
    this.eUi.ui.resizer.resizeOffset(this.setOffset, this, 'left', ['mid',-445], 0);
	this.eUi.ui.resizer.trigger();
    
	this.cmdLogList = [];
	this.cmdLogCallback = [];
    this.cmdLogId = 0;
}

EIGERSubseqCmdPrompt.prototype = {
    addCmdLog : function (callback, endAfter) {
        this.addNewLine();
        var tmpLog = this.addWidget(
                    EIGERSubseqCmdHandler, 
                    [this.eUi, {'success' : [this._step, this, [this.cmdLogId, 'success']],'error' : [this._step, this, [this.cmdLogId, 'error']]}]
                    );
        this.cmdLogList[this.cmdLogId] = tmpLog;
        this.cmdLogCallback[this.cmdLogId] = callback;
        this.cmdLogId++;
        this.endAfter = (endAfter === undefined) ? true : false;
        return tmpLog;
    },
	addCmd : function (args) {
		return(this.cmd01.addCmd.apply(this.cmd01, arguments));
	},
	addQObj : function (args) {
		return(this.cmd01.addQObj.apply(this.cmd01, arguments));
	},
	addMCmd : function (args) {
		return(this.cmd01.addMCmd.apply(this.cmd01, arguments));
	},
	exec : function (args) {
		return(this.cmd01.exec.apply(this.cmd01, arguments));
	},
    setCloseDone : function (value) {
        this.closeDone = value;
    } ,
	setTitle : function (args) {
		return(this.tlt01.setText.apply(this.tlt01,arguments));
	},
	setCmdHeight : function (args) {
		return(this.cmd01.setCmdHeight.apply(this.cmd01,arguments));
	},
    _step : function(data, cmdLogId, state) {
        if (this.cmdLogCallback[cmdLogId] !== undefined) {
            this.cmdLogCallback[cmdLogId][state][0].apply(this.cmdLogCallback[cmdLogId][state][1],[data].concat(this.cmdLogCallback[cmdLogId][state][2]));
        }
        if (cmdLogId === this.cmdLogId-1 && this.endAfter) {
            this.callback[state][0].apply(this.callback[state][1],[data].concat(this.callback[state][2]));
            if (this.closeDone) {
                this.remove();
            } else {
                var callee = this;
                var btn = this.addWidget(Button,['Close']);
                btn.click(function () {
                    callee.remove.apply(callee,[]);
                });
            }
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
    
    this.tblContainer = this.addWidget(BlockArea, parent, id, name, description)
	//this.tblContainer.jElement.css('overflow-y','scroll');
	this.tblContainer.jElement.css('overflow-x','hidden');
    
    this.setHeight('400px');
    
    this.table = this.tblContainer.addWidget(Table,[]);
	this.table.setWidth('865px');
	
	this.btn01 = this.addWidget(Button,['Cancel'])
	this.btn01.click(this.cancel, this);

	
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
	EXEC_VCLICK : 4,
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
	exportAsStr : function () {
		var exportQList = {};
		this.listOfQueues.forEach( function (element, index, array)
        {
            exportQList[index] = {
				"endingCommand" : element.endingCommand,
				"execStyle" : element.execStyle,
				"acceptType" : element.qObject.acceptType,
				"data" : element.qObject.data,
				"method" : element.qObject.method,
				"mimeType" : element.qObject.mimeType,
				"processData" : element.qObject.processData,
				"apiDomain" : element.qObject.instance.domain.name,
				"apiSubDomain" : element.qObject.instance.subdomain.name,
				"apiKey" : element.qObject.instance.name
			};
        }, this)
		return JSON.stringify(exportQList);
	},
	importFromStr : function (importStr) {
		var qImportObj = JSON.parse(importStr);
		for (var index in qImportObj)
        {
			obj = qImportObj[index];
			var value = ''
			try {
				value = JSON.parse(obj['data'])['value']
			} catch (err) {}
			this.addQObjByNames(obj['apiDomain'],
								obj['apiSubDomain'],
								obj['apiKey'],
								obj['method'],
								value,
								obj['execStyle'],
								obj['endingCommand']);
		}
	},
	addQObjByNames : function (qObjDomain, qObjSubDomain, qObjKey, qObjMethod, qObjValue, qObjExecStyle, qObjEndingCommand) {
		var subdomain = this.eUi.e[qObjDomain][qObjSubDomain];
		var key = (subdomain instanceof EIGERSpecialKey) ? subdomain : subdomain[qObjKey];
		var execStyle = (qObjExecStyle) ? this.EXEC_CLICK : this.EXEC_IMMED;
		switch(qObjMethod) {
			case 'GET':
				if (this.getDataType(key) === 'file') {
					this.addQObj(key.downloadFile(true), execStyle, qObjEndingCommand)
				} else {
					this.addQObj(key.updateKey(true), execStyle, qObjEndingCommand);
				}
				break;
			case 'PUT':
				try {   
					if (this.getDataType(key) === 'file') {
						this.addQObj(key.setUploadFile(qObjValue,true), execStyle, qObjEndingCommand);
					} else {
						this.addQObj(key.setValue(qObjValue,true), execStyle, qObjEndingCommand);
					}
				} catch (err) {
					alert(sprintf('Error in parsing value.\n\n%s', err));
				}
				break;
			default:
				break;    
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
					case this.EXEC_VCLICK:
						var id = this.listOfQueues[eIter]['qObject'].getId();
						this.rows[id].btn01.setDisabled(false);
						break;
				}
			} else {
				this.exec();
			}
		};
	},
    getDataType : function (key) {
        try { 
            if (key.name === 'flatfield' || key.name === 'pixel_mask') {
                var dataType = 'file';
            } else {
                var dataType = key.value_type.value;
            }
        } catch(err) {
            if (key.subdomain.index === 'command') {
                if (key.index === 'trigger') {
                    var dataType = 'float';
                } else {
                    var dataType = 'command';
                }
            }
        };
        return dataType;
    },
	end : function() {
        this.btn01.remove();
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
				this.rows[id].tfd03.ind01.setText(qInstance.progressText);
				this.rows[id].tfd03.ind01.grey();
			} else if  ( qInstance.status === 1 ) {
				if (this.status > -1 ) {
					this.status = 1;
				}
				this.rows[id].tfd03.ind01.setText(qInstance.progressText);
				this.rows[id].tfd03.ind01.warning();
				if (qListItem['execStyle'] === this.EXEC_CLICK || qListItem['execStyle'] === this.EXEC_ICLICK) {
					this.rows[id].btn01.remove();
				} else if (qListItem['execStyle'] === this.EXEC_VCLICK) {
					this.rows[id].btn01.remove();
					this.rows[id].inp01.remove();
                }
			} else if  ( qInstance.status === 2 ) {
				this.rows[id].tfd03.ind01.setText(qInstance.progressText);
				this.rows[id].tfd03.ind01.ok();
                if (qInstance.method === 'GET') {
                    try {
                        if (qInstance.acceptType === 'application/tiff') {
                            this.rows[id].btn01 = this.rows[id].tfd04.addWidget(Button, ['download']);
                            this.rows[id].btn01.click(qInstance.download, qInstance);
                        } else {
                            this.rows[id].tfd04.setText(qInstance.request.response.value);
                        }
                    } catch (err) {}
                }
				if ( qListItem['endingCommand'] === this.ENDING_COMMAND ) {
					this.end();
				} else {
					this.status = 2;
					this.exec();
				}
			} else if  ( qInstance.status < 0 && this.status >= 0) {
				this.statusText = qInstance.request.statusText;
				this.status = qInstance.status;
				
				this.rows[id].tfd03.ind01.setText(qInstance.progressText);
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
			} else if (qListItem['execStyle'] === this.EXEC_VCLICK) {
                this.rows[id].inp01 = this.rows[id].tfd04.addWidget(Input, []);
                this.rows[id].inp01.label.remove();
                this.rows[id].inp01.nwl01.setVisibility(false);
                this.rows[id].tfd04.addNewLine();
                this.rows[id].btn01 = this.rows[id].tfd04.addWidget(Button, ['exec']);
				this.rows[id].btn01.setDisabled(true);
                this.rows[id].inp01.setWidth('50px');
                this.rows[id].btn01.click(function (event) {
                    var value = parseFloat(callee.rows[id].inp01.getValue());
                    if (!isNaN(value)) {
                        qInstance.data = JSON.stringify({'value':value});
                        qInstance.exec();
                    } else {
                        alert('Failed casting to float...')
                    }
                }, qInstance);
                
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
			this.rows[id].tfd03.setText('queued');
		} else if  ( mQInstance.status === 1 ) {
			if (this.status > -1 ) {
				this.status = 1;
			}
			this.rows[id].tfd03.setText(sprintf('%3.1f%%',(mQInstance.getProgress()*100)));
            this.rows[id].tfd02.prb01.setProgress(mQInstance.getProgress());
		} else if  ( mQInstance.status === 2 ) {
			this.rows[id].tfd03.setText('sucess');
			this.exec();
		} else if  ( mQInstance.status < 0  && this.status >= 0) {
			this.rows[id].tfd02.prb01.setProgress(mQInstance.getProgress());
			this.rows[id].tfd03.setText('error');
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
	},
    remove : function () {
        this.getJElement().remove();
    },
    setCmdHeight : function (value) {
		var valueLength = value.length-2;
		var valueInt = value.substr(0,valueLength);
		this.getJElement().height(sprintf('%spx',parseInt(valueInt)+30));
		this.tblContainer.setHeight(value);
	},
    setHeight : function (value) {
		this.getJElement().height(value);
		var valueLength = value.length-2;
		var valueInt = value.substr(0,valueLength);
		this.tblContainer.setHeight(sprintf('%spx',parseInt(valueInt)-30));
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
	TableRow.call(this, parent, id, name, description);
	this.tfd01 = this.addWidget(TableField, []);
	this.tfd01.setText('ID');
	this.tfd01.setWidth('40px');
	this.tfd02 = this.addWidget(TableField, []);
	this.tfd02.setWidth('640px');
	this.tfd02.prb01 = this.tfd02.addWidget(Progressbar,[]);
	this.tfd02.prb01.setProgress(0);	
	this.tfd03 = this.addWidget(TableField, []);
	this.tfd03.setText('Status');
	this.tfd03.setWidth('100px');
	this.tfd04 = this.addWidget(TableField, []);
	this.tfd04.setText('Error');
	this.tfd04.setWidth('70px');
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
extend(TableRow, EIGERTableMCRow);
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
		
		var callback = {'success' : [this._checkConSuccess, this, [address, port, init]],'error' : [this._checkConError, this, []]};

		this.cmp01 = new EIGERSubseqCmdPrompt( this.ui.body, 0, 'EHC', 'EIGER Command Handler', this, callback);
		this.cmp01.setTitle(sprintf('Trying to connect to %s:%s', address, port));
        
        this.cmd01 = this.cmp01.addCmdLog({'success' : [this._getKeys, this, [address, port, init]],'error' : [this._checkConError, this, []]}, false);
		this.cmd01.setCmdHeight('35px');
		
		this.cmd01.addCmd(this.e.detector.version, ['GET','']);
    },    
    _getKeys : function (data, address, port, init) {
        var version = this.e.detector.version.value.value;
        this.e.setVersion(version);

		//this.e.reconstruct();
		this.updateUiConnections();
        
        this.cmd02 = this.cmp01.addCmdLog();
        
        var cmdHeight = 4;
		this.cmd02.addCmd(this.e.detector.config.keys, ['GET','']);
		this.cmd02.addCmd(this.e.detector.status.keys, ['GET','']);
        if (this.e.detector.command.keys) {this.cmd02.addCmd(this.e.detector.command.keys, ['GET','']); cmdHeight++;};
		this.cmd02.addCmd(this.e.filewriter.config.keys, ['GET','']);
		this.cmd02.addCmd(this.e.filewriter.status.keys, ['GET','']);
        if (this.e.filewriter.command.keys) {this.cmd02.addCmd(this.e.filewriter.command.keys, ['GET','']); cmdHeight++;};
        
        if (this.e.monitor) {
            this.cmd02.addCmd(this.e.monitor.config.keys, ['GET','']);
            cmdHeight++;
            this.cmd02.addCmd(this.e.monitor.status.keys, ['GET','']);
            cmdHeight++;
            if (this.e.monitor.command.keys) {this.cmd02.addCmd(this.e.monitor.command.keys, ['GET','']); cmdHeight++;};
        }
        if (this.e.stream) {
            this.cmd02.addCmd(this.e.stream.config.keys, ['GET','']);
            cmdHeight++;
            this.cmd02.addCmd(this.e.stream.status.keys, ['GET','']);
            cmdHeight++;
            if (this.e.stream.command.keys) {this.cmd02.addCmd(this.e.stream.command.keys, ['GET','']); cmdHeight++;};
        }
        
		this.cmd02.setCmdHeight(sprintf('%spx', cmdHeight*30));
	},
	_checkConSuccess : function (data, address, port, init) {
		var qTime = data.listOfQueues[1]['qObject'].endTime - data.listOfQueues[0]['qObject'].startTime;
		this.refInterval = (qTime+1000)*5;
		console.log(sprintf('Requests took %s ms to complete. Using %s ms as reference interval setting.', qTime, this.refInterval));
		this._connect(address, port, init);
	},
	_checkConError : function(data) {
		this.cmp01.remove();
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
		
		this.cmp01 = new EIGERSubseqCmdPrompt( this.ui.body, 0, 'EHC', 'EIGER Command Handler', this, callback);
		this.cmp01.setTitle(titleStr);
        
        this.cmd01 = this.cmp01.addCmdLog();
		this.cmd01.setCmdHeight(cmdHeight);
		
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
		this.e.connectionStateID = 2;
		var acqView = this.getView('Acquire');
		
        //Remove old click listeners
        this.ui.cset.inp01.setDisabled(true);
        this.ui.cset.inp02.setDisabled(true);
        this.ui.cset.frm01.clearSubmit();
        this.ui.cset.btn02.setText('disconnect');
        this.ui.cset.btn02.click(function() {window.location.reload(),[]});
        
        this.switchView(acqView);
        this.ui.acq.connect();
		this.ui.acq.disableAdvMode();
		this.ui.acq.chk04.setDisabled(false);
		
		// Show hidden widgets
		this.ui.showHiddenHomeWidgets();
	
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
		for (var index in this.uiConnections) {
			this.uiConnections[index].setInterval();
            this.uiConnections[index].eigerValue.refreshed();
		};
	},
	uiConnect : function(widget, eigerValue, interval, form) {
		var id = this.uiInstInt++;
		var tmp = new EIGERUiConnector(this, id, widget, eigerValue, interval, form);
		this.uiConnections[id] = tmp;
        return tmp;
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
				
			this.cmp01 = new EIGERSubseqCmdPrompt( this.eUi.ui.body, 0, 'EHC', 'EIGER Command Handler', this.eUi, {'success' : [this.success, this, [submit]],'error' : [this.putError, this, []]});
			this.cmp01.setTitle(sprintf('Updating value %s...', this.eigerValue.index));
            
            this.cmd01 = this.cmp01.addCmdLog();
			this.cmd01.setCmdHeight('35px');
			
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
	success : function(data, submit) {
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
        this.cmp01 = new EIGERSubseqCmdPrompt( this.eUi.ui.body, 0, 'EHC', 'EIGER Command Handler', this.eUi, {'success' : [this.error, this, []],'error' : [this.error, this, []]});
        this.cmp01.setTitle(sprintf('Recovering value %s...', this.eigerValue.index));
        
        this.cmd01 = this.cmp01.addCmdLog();
        this.cmd01.setCmdHeight('35px');
        
        this.cmd01.addCmd(data.listOfQueues[0]['qObject'].instance, ['GET', '']);
	},
    error : function(data) {
		this.cmd01 = '';
        this.reattachSubmit();
    }
};
function SVGElement(parent, id, name, description) {
    this.parent = parent;
    this.id = id;
    this.name = name;
    this.description = description;
    
    this.svgNS = this.parent.getSVG().namespaceURI;
}
SVGElement.prototype = {
    getSVG : function () {
        return this.element;
    }
}

function SVGGroup(parent, id, name, description) {
    SVGElement.call(this, parent, id, name, description);
    
    this.type = 'group';
    this.svgElementList = [];
    
    this.element = document.createElementNS(this.svgNS,'g');
    this.parent.getSVG().appendChild(this.element);
    
    this.paths = [];
}
SVGGroup.prototype = {
    setAttr : function(args) {
        this.element.setAttribute(arguments[0],arguments[1]);
    },
	addSVGObject : function(args)
	{
		var defaultArgs = [this, uniId++, arguments[0].type, 'ToDo'];
		var svgElement = construct(arguments[0],defaultArgs.concat(arguments[1]));
		this.svgElementList.push(svgElement);
		return svgElement;
	},
    addSVGPaths : function(pathDefs)
    {
        pathDefs.forEach( function (element, index, array) {
            var path = this.addSVGObject(SVGPath, [element]);
            this.paths.push(path);
        }, this);
    },
    setSVGPathsAttr : function(args)
    {
        var attrArguments = arguments;
        this.paths.forEach( function (element, index, array)
        {
            element.setAttr2.apply(element, attrArguments)
        }, this)
    }
}

function SVGObject(parent, id, name, description) {
    SVGElement.call(this, parent, id, name, description);
}
SVGObject.prototype = {
    setAttr : function(args) {
        this.element.setAttribute(arguments[0],arguments[1]);
    },
    setAttr2 : function(args) {
        this.element.setAttribute(arguments[0],arguments[1]);
    },
    setFill : function(value) {
        this.setAttr('fill', value);
    },
    setStroke : function(value) {
        this.setAttr('stroke', value);
    },
    setStrokeWidth : function(value) {
        this.setAttr('stroke-width', value);
    }
}

function SVGPath(parent, id, name, description, pathDef) {
    SVGObject.call(this, parent, id, name, description);
    
    this.type = 'path';
    this.element = document.createElementNS(this.svgNS,'path');
    this.element.setAttribute('id', id);
    this.element.setAttribute('d', pathDef);
    this.parent.getSVG().appendChild(this.element);
}
SVGPath.prototype = {
}

function EIGERSVGModule(parent, id, name, description, xOffset, yOffset, scale) {
    SVGGroup.call(this, parent, id, name, description);

    this.xOffset = xOffset;
    this.yOffset = yOffset;
    
    this.setAttr('transform',sprintf('matrix(%f,0,0,%f,%f,%f)', scale, scale, xOffset, yOffset));
    
    this.mcbs = []
    
    var mcb = this.addSVGObject(EIGERSVGMCB, [0, 0]);
    mcb.setSVGPathsAttr('fill', 'none');    
    mcb.setSVGPathsAttr('stroke', '#000000');  
    mcb.setSVGPathsAttr('stroke-width', '15px');  
    
    this.sensor = this.addSVGObject(EIGERSVGBack, [0, 0]);
    this.sensor.setSVGPathsAttr('fill', 'none');    
    this.sensor.setSVGPathsAttr('stroke', '#aaaaaa');  
    this.sensor.setSVGPathsAttr('stroke-width', '10px');
    
    mcb = this.addSVGObject(EIGERSVGMCB, [0, 732]);
    mcb.setSVGPathsAttr('fill', 'none');    
    mcb.setSVGPathsAttr('stroke', '#000000');  
    mcb.setSVGPathsAttr('stroke-width', '15px');  
    this.mcbs.push(mcb);
    
    this.sensor = this.addSVGObject(EIGERSVGFront, [0, 0]);
    this.sensor.setSVGPathsAttr('fill', 'none');    
    this.sensor.setSVGPathsAttr('stroke', '#aaaaaa');  
    this.sensor.setSVGPathsAttr('stroke-width', '10px');
    
    chipOffsets = [
        [0,0],
        [1190,65],
        [2380,130],
        [3570,195],
        [0,1255],
        [1190,1320],
        [2380,1385],
        [3570,1450]
    ]
    
    this.rocs = [];
    
    chipOffsets.forEach(function(element, index, array){
        var chip = this.addSVGObject(EIGERSVGChip, [element[0], element[1]]);
        chip.setSVGPathsAttr('fill', 'none');    
        chip.setSVGPathsAttr('stroke', '#aaaaaa');  
        chip.setSVGPathsAttr('stroke-width', '10px');  
        this.rocs.push(chip);
    }, this);
    
    this.sensor = this.addSVGObject(EIGERSVGSensor, [0, 0]);
    this.sensor.setSVGPathsAttr('fill', '#ffffff');    
    this.sensor.setSVGPathsAttr('stroke', '#000000');  
    this.sensor.setSVGPathsAttr('stroke-width', '15px');  
    this.sensor.setSVGPathsAttr('fill-opacity', '.6');  
    
    console.log(this.sensor)
    var callee = this;
    this.sensor.paths[0].element.onclick = function() {
        alert('hi');
    }
}

EIGERSVGModule.prototype = {
};

function EIGERSVGSensor(parent, id, name, description, xOffset, yOffset) {
    SVGGroup.call(this, parent, id, name, description);

    this.xOffset = xOffset;
    this.yOffset = yOffset;
    
    this.setAttr('transform',sprintf('matrix(%f,0,0,%f,%f,%f)', 1, 1, xOffset, yOffset));
    
    var pathDefs = 
            [
        'm1523,4394 l5,-2445 l4765,260 l0,0 l0,2445 z'
            ];
    
    this.addSVGPaths(pathDefs);  
}

EIGERSVGSensor.prototype = {
};

function EIGERSVGChip(parent, id, name, description, xOffset, yOffset) {
    SVGGroup.call(this, parent, id, name, description);

    this.xOffset = xOffset;
    this.yOffset = yOffset;
    
    this.setAttr('transform',sprintf('matrix(%f,0,0,%f,%f,%f)', 1, 1, xOffset, yOffset));
    
    var pathDefs = 
            [
        'm 1533,1915 l 0,1255 l 1190,65 l 0,-1250 z',
        'm 1542,1900 l 0,1255 l 1190,65 l 0,-1250 z'
            ];
    
    this.addSVGPaths(pathDefs);  
}

EIGERSVGChip.prototype = {
};

function EIGERSVGFront(parent, id, name, description, xOffset, yOffset) {
    SVGGroup.call(this, parent, id, name, description);

    this.xOffset = xOffset;
    this.yOffset = yOffset;
    
    this.setAttr('transform',sprintf('matrix(%f,0,0,%f,%f,%f)', 1, 1, xOffset, yOffset));
    
    var pathDefs = 
            [
        'm 6440,4620 l 0,-2580 l -4780,-265 l 5,2580 z',
        'm 6440,4620 l -115,85 l 0,-130 l 20,-10 l 0,-165 l -20,15 l -5,-2010 l 20,-20 l 0,-160 l -20,20 l 0,-125 l 120,-80',
        'm 1661.8051,4355.9366 l -115,85 l 0,-130 l 20,-10 l 0,-165 l -20,15 l -5,-2010 l 20,-20 l 0,-160 l -20,20 l 0,-125 l 120,-80',
        'm 1540,1980 l 4780,265',
        'm 1541,2141 l 4780,265',
        'm 1559,2121 l 4780,265',
        'm 1547,4313 l 4780,265',
        'm 1545,4154 l 4780,265',
        'm 1565,4298 l 4780,265',
        'm 1544,4441 l 4780,265',
        'm 1541,1857 l 4780,265'
            ];
    
    this.addSVGPaths(pathDefs);  
}

EIGERSVGFront.prototype = {
};

function EIGERSVGBack(parent, id, name, description, xOffset, yOffset) {
    SVGGroup.call(this, parent, id, name, description);

    this.xOffset = xOffset;
    this.yOffset = yOffset;
    
    this.setAttr('transform',sprintf('matrix(%f,0,0,%f,%f,%f)', 1, 1, xOffset, yOffset));
    
    var pathDefs = 
            [
        'm 2180,3250 0,-440 -229.0765,-15.4815 c -95,-5 -148,65 -148,135 l 0,155 c 3,90 58,140 138,150 z',
        'm 1771,2878 95,-63',
        'm 2180,3250 85,-60 0,-75 2065,-1360',
        'm 2265,3190 -60,-10 0,-75 60,10',
        'm 2264,3113 157,-103 c 60,-45 58,-312 1,-272 l -153,110',
        'm 2204,3104 157,-103 c 60,-45 58,-312 1,-272 l -153,110',
        'm 2180,2810 1846,-1226 415,23 339,-227 -445,-25 -1960,1300 30,8',
        'm 2270,2845 -60,-5 0,-55 60,5 z',
        'm 2205,3180 195,-121',
        'm 2399,3056 1.2658,-390.9011 -30,-10 -160,165 0,60 z',
        'm 6248,3539 c 95,5 148,-65 148,-135 l 0,-155 c -3,-90 -58,-140 -138,-150 L 1860,2855 c -95,-5 -148,65 -148,135 l 0,155 c 3,90 58,140 138,150 z',
        'm 6105,3023 0,440 229,15 c 95,5 148,-65 148,-135 l 0,-155 c -3,-90 -58,-140 -138,-150 z',
        'm 6197,3326 157,-103 c 60,-45 58,-312 1,-273 l -153,110',
        'm 6251,3333 157,-103 c 60,-45 58,-312 1,-273 l -153,110',
        'm 6100,3460 95,-55 0,-80 60,5 0,80 -60,-5',
        'm 6105,3025 90,-60 65,5 0,95 -62,-7 -3,-93',
        'm 6260,2970 195,-125 0,435 -200,130',
        'm 6455,2845 25,0 155,170 0,120 -155,147 -25,-2',
        'm 6480,2845 1960,-1300 40,35 0,365 -2000,1335',
        'm 6635,3015 1930,-1275 0,115 -1930,1280',
        'm 8480,1945 85,-90',
        'm 8565,1740 -85,-160',
        'm 8440,1545 -455,-30 0,440 445,25',
        'm 4780,1780 -450,-25 -195,-145 0,-75 155,-150 45,-30',
        'm 4290,1390 0,330',
        'm 2210,2880 1925,-1270',
        'm 4135,1535 -1925,1285',
        'm 4660,1460 2080,100 -140,100 c -34,32 29,34 80,40 l 820,40 c 54,0 123,17 160,0 l 325,-225',
        'm 4780,1780 -221,163 C 4530,1970 4480,1990 4520,2000 l 860,60 c 40,5 107,9 160,-20 l 165,-127 2113,145',
        'm 4660,1460 0,410',
        'm 4780,1780 0,-400',
        'm 7985,1955 -165,100 0,-425'
            ];
    
    this.addSVGPaths(pathDefs);  
}

EIGERSVGBack.prototype = {
};

function EIGERSVGMCB(parent, id, name, description, xOffset, yOffset) {
    SVGGroup.call(this, parent, id, name, description);

    this.xOffset = xOffset;
    this.yOffset = yOffset;
    
    this.setAttr('transform',sprintf('matrix(%f,0,0,%f,%f,%f)', 1, 1, xOffset, yOffset));
    
    var pathDefs = 
            [
        'm 2233.6927,2665.4629 70,-50 -60,-3 1940,-1292 330,20 200,-125 3190,175 -185,125 325,20 -1940,1290 -60,-5 -75,50 -1475,-80 70,-50 -790,-40 -70,45 z',
        'm 2232.5389,2785.3466 70,-50 -60,-3 1940,-1292 330,20 200,-125 3189.9998,175 -185,125 325,20 -1939.9998,1290 -60,-5 -75,50 -1475,-80 70,-50 -790,-40 -70,45 z',
        'm 4488,2793 0,120',
        'm 4565,2741 0,120',
        'm 3773,2705 0,120',
        'm 3702,2743 0,120',
        'm 2231,2668 0,120',
        'm 2305,2615 0,120',
        'm 2246,2612 0,120',
        'm 4184,1320 0,120',
        'm 4512,1338 0,120',
        'm 4714,1217 0,120',
        'm 7718,1518 0,120',
        'm 7907,1389 0,120',
        'm 8045,1537 0,120',
        'm 6101,2827 0,120',
        'm 6045,2821 0,120',
        'm 5966,2872 0,120'
            ];
    
    this.addSVGPaths(pathDefs);  
}

EIGERSVGMCB.prototype = {
};

extend(SVGElement, SVGGroup);
extend(SVGElement, SVGObject);
extend(SVGObject, SVGPath);
extend(SVGGroup, EIGERSVGModule);
extend(SVGGroup, EIGERSVGSensor);
extend(SVGGroup, EIGERSVGChip);
extend(SVGGroup, EIGERSVGFront);
extend(SVGGroup, EIGERSVGBack);
extend(SVGGroup, EIGERSVGMCB);