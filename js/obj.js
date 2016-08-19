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