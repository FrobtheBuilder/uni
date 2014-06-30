/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

if ( !String.prototype.contains ) {
    String.prototype.contains = function() {
        return String.prototype.indexOf.apply( this, arguments ) !== -1;
    };
}

function randInt(min,max){
	var range = max - min;
	// it actually does work the other way...
	// if (range < 0) { throw new RangeError("min must be less than max"); }
	
	var rand = Math.floor(Math.random() * (range + 1));
	return min + rand;
}

function choose(arr) {
    return arr[randInt(0, arr.length-1)];
}

var stat = {
    layers: 0,
    things: {_array: []},
    nthings: 0,
    collections: {},
    instances: [],
    ninstances: 0
};

var util = {
    getDirection: function() {
        return choose(["north", "south", "east", "west"]);
    }
}

stat.collections.getRandomName = function(collection) {
    return choose(this[collection]).name;
};

function Thing(name, contains, callback) {
    this.name = name;
    this.dispname = this.name;
    this.callback = callback;
    this.contains = contains;
    
    stat.things[this.name] = this;
    stat.things._array.push(stat.things[this.name]);
    this.id = stat.nthings;
    stat.nthings++;
}


function Instance(type) {
    this.type = stat.things[type];
    this.id = stat.ninstances;
    this.name = this.type.name;
    this.dispname = this.type.dispname;
    this.children = [];
    
    this.element = null;
    this.parent = null;
    this.opened = false;
    
    stat.instances[this.id] = this;
    stat.ninstances++;
    
    this.grown = false;
    this.show = false;
    
    if (this.type.callback !== null && typeof this.type.callback === "function") {
        this.type.callback.call(this);
    }
    
    this.buildElement();
}

Instance.prototype.buildElement = function() {
    this.element = $("<div></div>")
                    .addClass("num"+this.id)
                    .addClass("instance closed")
                    .attr("id", this.id)
                    .append($("<div></div>").addClass("name").text(this.dispname))
                    //.css("background-color", "rgb("+(255-(that.countLayers()*5))+", "+(255-(that.countLayers()*5))+", "+(255-(that.countLayers()*5))+")");
    this.element.host = this;
};

Instance.prototype.addChild = function(child) {
    child.parent = this;
    this.children.push(child);
    this.element.append(child.element);
};

Instance.prototype.toggle = function() {
    if (this.opened){
        this.children.forEach(function(elem) {
            elem.show = false;
        });
        this.opened = false;
        this.element.removeClass("opened");
        this.element.addClass("closed");
    }
    else {
        (this.grown || this.grow());
        this.opened = true;
        this.children.forEach(function(elem) {
            elem.show = true;
        });
        this.element.removeClass("closed");
        this.element.addClass("opened");
    }
    this.display();
};


Instance.prototype.grow = function() {
    var that = this;
    if (this.type.contains !== undefined) {
        this.type.contains.forEach(function(element) {
            that.processString(that.processCollection( "random", element, stat.collections)).forEach(function(elem) {
                that.addChild(elem);
            });
        });
    }
    this.grown = true;
    stat.layers++;
};

//convert a ".collection" string into an actual thing name by some means
Instance.prototype.processCollection = function(method, element, collections) {
    if (element.contains(".")) {
        if (method === "random") {
            var collectionString = element.split(".")[1];
            var collectionName;
            var collectionMod;

            if (collectionString.contains(",")) {
                collectionName = collectionString.split(",")[0];
                collectionMod = collectionString.split(",")[1];
            }
            else {
                collectionName = collectionString;
                collectionMod = "";
            }
            element = collections.getRandomName(collectionName)+","+collectionMod;
        }
    }
    return element;
};

//process a string like "item,20%" or "item,1-9" into a meaningful array of instances that can be added another
Instance.prototype.processString = function(element) {
    var elemArray;
    var returnArray = [];
    
    if (element.contains(",")) {
        elemArray = element.split(",");
        if (elemArray[1].contains("%")) {
            var chance = elemArray[1].split("%")[0];
            chance = chance/100;
            console.log("making "+elemArray[0]+" with "+chance+" chance");
            if (Math.random() < chance) {
                returnArray.push(new Instance(elemArray[0]));
            }
        } 
        else if (elemArray[1].contains("-")) {
            var startend = elemArray[1].split("-");
            console.log("making between "+startend[0]+" and "+startend[1]+" "+elemArray[0]);
            startend[0] = new Number(startend[0]);
            startend[1] = new Number(startend[1]);
            var num = randInt(startend[0], startend[1]);
            for (var i = 0; i < num; i++) {
                returnArray.push(new Instance(elemArray[0]));
            }
        }
        else {
            for (var i = 0; i < elemArray[1]; i++) {
                returnArray.push(new Instance(elemArray[0]));
            }
        }
    } 
    else {
        returnArray.push(new Instance(element));
    }
    return returnArray;
};
    


//Yknow this used to be recursive! Shame that didn't work out...
//this actually shows the element, appending it to its parent, and appending its children without showing them
//unless of course the object is opened
Instance.prototype.display = function(clear) {
    var container;
    if (this.parent === null || this.parent.element === null) {
        container = $(".container");
        container.append(this.element);
    }
    else {
        container = this.parent.element;
    }
    if (clear) container.html("");
    
    
    this.reveal();
    
    var that = this; // hurr durr I'm javascript and I can't pass this to nested functions durrrrr
    if (this.children.length > 0) {
        this.children.forEach(function(elem) {
            elem.reveal();
            that.element.append(elem.element);
        });
    }
};

//show or hide element based on variable hurr durr
Instance.prototype.reveal = function() {
    if (this.show === false) {
        this.element.css("display", "none");
    }
    else {
        var layers = this.countLayers();
        console.log(layers);
        this.element.css({
                    "display": "block",
                    "background-color": 'rgb('+(255-(layers*3))+','+(255-(layers*1))+','+(255-(layers*3))+')'
        });
    }
};

Instance.prototype.countLayers = function() {
    var layers = 0;
    count(this);
    function count(inst) {
        if (inst.parent) {
            layers++;
            count(inst.parent);
        }
    }
    return layers;
}




function makeThings(template) {
    template.forEach(function(element) {
        var th = new Thing(element.nm, element.ct, element.cb, element.co);
        if (element.dn) {
            th.dispname = element.dn;
        }
        if (element.co) {
            if (stat.collections[element.co] === undefined) stat.collections[element.co] = [];
            stat.collections[element.co].push(th);
            th.collection = element.co;
        }
    });
}

makeThings(template);


var topLevel = new Instance("universe");
topLevel.show = true;
topLevel.display();
topLevel.reveal();

$(document).ready(function() {
    $(".container").on("click", ".name", function(e){
        stat.instances[e.target.parentElement.id].toggle();
        console.log(e.target.parentElement.id);
        console.log("click");
    });
});