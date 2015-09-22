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
	} else if ( this.subdomain.index === 'status' ) { // Fix for an incompability with JAUN, seems like a bug to me
		this.constructChild('access_mode', 'r');
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