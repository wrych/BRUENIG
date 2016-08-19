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