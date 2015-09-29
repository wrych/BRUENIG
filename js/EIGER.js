var defaultVersion = '1.0.0';
var domains = ['detector','filewriter'];
var subdomains = ['config', 'status', 'command'];
var detkeys = {'config':["auto_summation", "beam_center_x", "beam_center_y", "countrate_correction_applied", "countrate_correction_bunch_mode", "count_time", "data_collection_date", "detector_number", "efficiency_correction_applied", "element", "flatfield_correction_applied", "frame_time", "nimages", "number_of_excluded_pixels", "photon_energy", "pixel_mask_applied", "sensor_material", "sensor_thickness", "software_version", "threshold_energy", "trigger_mode", "virtual_pixel_correction_applied", "ntrigger"]
				, 'status' : ["state"]
				, 'command' : ['initialize','arm','disarm','trigger','cancel','abort']};
var fwrkeys = {'config': ["transfer_mode", "image_nr_start", "mode", "nimages_per_file", "name_pattern", "compression_enabled"], 
				'status': ["state", "error", "time", "buffer_free"], 
				'command': ["clear"]};
var monkeys = {'config': [], 
				'status': [], 
				'command': []};
var stmkeys = {'config': [], 
				'status': [], 
				'command': []};

var specialKeys = [{'domain' : 'detector', 'subdomain' : 'version', 'versionInURI' : false},
                    {'domain' : 'filewriter', 'subdomain' : 'version', 'versionInURI' : false},
					{'domain' : 'filewriter', 'subdomain' : 'files', 'versionInURI' : true}];
				
var keys = {};
keys['detector'] = detkeys; 
keys['filewriter'] = fwrkeys;
keys['monitor'] = monkeys;
keys['stream'] = stmkeys;


                    

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
    this.progressText = '';
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
    this.progressText = '';
	
    if ( typeof cmd[0] === 'function' ) {
        this.listOfQueues = cmd[0].apply(cmd[1][0],cmd[1]);
    } else {
        this.listOfQueues = cmd;
    }
	
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
		qInstance.progressText = 'Quered';
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
		qInstance.progressText = 'Sent';
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
		qInstance.request = $.ajax({
			url: url,
			type: qInstance.method,
			contentType: "application/json",
            timeout: 0,
			data: qInstance.data
			});
		qInstance.request.done(function(data) { 
				callee.sucess.apply(callee, [qInstance, data]);
		});
		qInstance.request.fail(function(data) { 
				callee.error.apply(callee, [qInstance, data]);
		});

	},
    sucess : function (qInstance, data) {
		qInstance.setResponse(data);
        // Remove <&& qInstance.instance.domain === 'detector'> once API is consistent :)
        if (qInstance.method === 'PUT' && qInstance.instance.subdomain.index === 'config' && qInstance.instance.domain.index === 'detector') {
            this._putSuccess(qInstance, data);
        } else {
            this._success(qInstance, data);
        }
    },
	_success : function(qInstance, data) {
		qInstance.setStatus(2);
		qInstance.progressText = 'Done';
		qInstance.endTime = new Date().getTime();
		this.notifyQListenerUpdate(qInstance);
		this.history++;
		delete this.activeQueries[qInstance.id];
	},
    _putSuccess : function (qInstance, data) {
        var changedKeys = data;
		var domain = qInstance.instance.domain;
		var subdomain = qInstance.instance.subdomain;
		
        if (!isNaN(Number(changedKeys.length)) && changedKeys.length > 0) {
            var qList = [];
            for (var i = 0 ; i < changedKeys.length ; i++) {
                if ( !inExcludedKeys(changedKeys[i]) ) {
                    var qInst = this.add2Queue(new EIGERQuery(subdomain[changedKeys[i]], this, 'GET'));
                    qList.push(qInst);
                }
            }
            var mQ = new EIGERMQuery(this, qList, this, function () {}, this._updateMQ);
            mQ.mainQ = qInstance;
            this.add2Queue(mQ);
        }
    },
    _updateMQ : function (qMInstance) {
        qMInstance.mainQ.progressText = sprintf('UD %3.1f%%',qMInstance.getProgress()*100);
		this.notifyQListenerUpdate(qMInstance.mainQ);
        if (qMInstance.status === 2) {		
            this.history++;
            delete this.activeQueries[qMInstance.id];
            this._success(qMInstance.mainQ, qMInstance.mainQ.response);
        }
    },
	error : function(qInstance, data) {
        if (qInstance.request.status == 504 || qInstance.request.statusText === 'timeout') {
            switch (qInstance.instance.index) {
                case 'trigger' :
                    this.stateListener(qInstance, ['idle','ready'], ['acquire']);
                    break;
                case 'arm':
                    this.stateListener(qInstance, ['idle','ready'], ['configure']);
                    break;
                case 'initialize':
                    this.stateListener(qInstance, ['idle'], ['initialize']);
                    break;
                default:
                    this._error(qInstance, data);
                    break;
            }
        } else {
            this._error(qInstance, data);
        }
	},
    _error : function (qInstance, data) {
        qInstance.setResponse(data);
		qInstance.progressText = 'Error';
        qInstance.setStatus(-1);
        this.notifyQListenerUpdate(qInstance);
        this.history[qInstance.id] = qInstance;
        this.history++;
        delete this.activeQueries[qInstance.id];  
    },
    stateListener : function (qInstance, successStates, allowedStates) {
        qInstance.progressText = 'StateMode';
        console.log(sprintf('Request timedout, changing to state listener mode...', qInstance.instance.index));
		this.notifyQListenerUpdate(qInstance);
        var callee = this;
        var listenerIndex = qInstance.instance.superDet.detector.status.state.refresh( function () {
            callee.stateChange.apply(callee, [qInstance, successStates, allowedStates])
        }, this);
        qInstance.listenerIndex = listenerIndex;
    },
    stateChange : function (qInstance, successStates, allowedStates) {
        var state = qInstance.instance.superDet.detector.status.state.value.value;
        var success = false;
        for (index in successStates) {
            if ( state === successStates[index] ) {
                success = true;
                break;
            }
        }
        console.log(sprintf('Checking state: %s (value: %s, expected: [%s])', success, state, successStates.join()));
        if (success) {
            qInstance.instance.superDet.detector.status.state.unbindRefresh(qInstance.listenerIndex);
            this.sucess(qInstance);
        } else {
            var failState = true;
            for (var index in  allowedStates) {
                if (allowedStates[index] === state) {
                    failState = false;
                    break;
                }
            }
            if (failState) {
                qInstance.instance.superDet.detector.status.state.unbindRefresh(qInstance.listenerIndex);
                this._error(qInstance);
            }
        }
    }
};

function EIGERContainer() {
	this.versionInURI = true;
	this.refreshListeners = [];
    this.children = [];
};

EIGERContainer.prototype = {
	addChilds : function(list) {
		for ( var index in list ) {
			var child = this.constructChild(list[index]);
			this[list[index]] = child;
            this.children[list[index]] = child;
		}
	},	
	refresh : function (action, thisArg) {
		return this.refreshListeners.push([action, thisArg])-1;
	},
    unbindRefresh : function (listenerIndex) {
		return delete this.refreshListeners[listenerIndex];
    },
	refreshed: function(event){
		for (var index in this.refreshListeners) {
			this.refreshListeners[index][0].apply(this.refreshListeners[index][1], [event]);
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
    
	this.connectionStateID = 0;
	
	this.handler = handler;
    
    if (version === undefined) {
        this.setVersion(defaultVersion);
    } else {
        this.setVersion(version);
    }
    
    console.log(this);
	
	this.handler.addQueueListener(this, this.updateQItem) 
};

EIGER.prototype = {
    reconstruct : function() {    
        var addDomains = [];
    
        if ( this.isVersionOrHigher(1,0,0) ) {
            addDomains.push('monitor');
        }
        if ( this.isVersionOrHigher(1,5,0) ) {
            addDomains.push('stream');   
        }

        this.addChilds(domains.concat(addDomains));
        
    },
	constructChild : function(index) {
		return new EIGERDomain(this, index);
	},
	setHost : function(address, port) {
		this.address = address;
		this.port = port;
	},
	setVersion : function (version) { 
		this.version = version;   
        var versionArr = this.version.split('.');
        this.versionArr = [];
        for (var index in versionArr) {
            this.versionArr.push(versionArr[index]);
        }
        this.reconstruct();
	},
	updateQItem : function(qInstance) {
		if (qInstance.status === 2) {
			qInstance.instance.updateValues(qInstance.getResponse());
		}
	},
    isVersionOrHigher : function(mayor, minor, patch) {
        if ( ( mayor < this.versionArr[0] ) || (((minor < this.versionArr[1])||(patch <= this.versionArr[2] && minor == this.versionArr[1])) && mayor == this.versionArr[0]) ) {
            return true;
        } else {
            return false;
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
    if (this.superDet.isVersionOrHigher(1,0,0)) {
        this.constructVersionedChilds(subdomains,specialKeys.concat([{'domain' : 'monitor', 'subdomain' : 'version', 'versionInURI' : false},{'domain' : 'monitor', 'subdomain' : 'images', 'versionInURI' : true}]));
    } else {
        this.constructVersionedChilds(subdomains,specialKeys);
    }
};

EIGERDomain.prototype = {
	constructChild : function(index) {
		return new EIGERSubDomain(this.superDet, this,  index);
	},
    constructVersionedChilds: function(vSubdomains, vSpecialKeys) {
        this.addChilds(vSubdomains); 
        for (var index in vSpecialKeys){
            if (vSpecialKeys[index]['domain'] === this.index) {
                this.children[vSpecialKeys[index]['subdomain']] = new EIGERSpecialKey(this.superDet, this, vSpecialKeys[index]['subdomain'], vSpecialKeys[index]['versionInURI']);
                this[vSpecialKeys[index]['subdomain']] = this.children[vSpecialKeys[index]['subdomain']];
            }
        }
    } 
};

function EIGERSubDomain(superDet, domain, index) {
	EIGERContainer.call(this);
	this.superDet = superDet;
	this.domain = domain;
	this.index = index;
    this.name = index;
    if (this.superDet.isVersionOrHigher(1,5,0)) {
        this.addChilds(keys[this.domain.index][this.index].concat(['keys']));
    } else if (this.index === 'config' || this.index ===  'status') {
        this.addChilds(keys[this.domain.index][this.index].concat(['keys']));
    } else {
        this.addChilds(keys[this.domain.index][this.index]);
    }
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
	if ( this.subdomain.index === 'command' ) {
		this.constructChild('access_mode', 'w');
	} else if ( this.subdomain.index === 'status' || this.index == 'keys') { // Fix for an incompability with JAUN, seems like a bug to me
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
        var newKeys = [];
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
					newKeys.push(valueTuple[vIndex]);
				}
			}
            this.subdomain.children.concat(this.subdomain.addChilds(newKeys));
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