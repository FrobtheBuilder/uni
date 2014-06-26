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

var stat = {};
stat.layers = 0;

stat.things = {};
stat.things._array = []
stat.nthings = 0;

function Thing(name, contains, instName) {
    this.name = name;
    stat.things[this.name] = this;
    stat.things._array.push(stat.things[this.name]);
    this.contains = contains;
    this.id = stat.nthings;
    stat.nthings++;
    if (instName !== undefined) {
        this.instName = instName;
    }
    else {
        this.instName = this.name;
    }
    
}

stat.instances = [];
stat.ninstances = 0;
function Instance(type) {
    this.type = stat.things[type];
    
    if (this.type.instName !== null && typeof this.type.instName === "function") {
        this.name = this.type.instName();
    }
    else {
        this.name = this.type.instName;
    }
    if (name) this.name = name;
    this.children = [];
    this.id = stat.ninstances;
    stat.instances[this.id] = this;
    this.element = null;
    this.parent = null;
    this.opened = false;
    stat.ninstances++;
    
    this.grown = false;
    this.show = false;
    this.buildElement();
}

Instance.prototype.buildElement = function() {
    this.element = $("<div></div>")
                    .addClass("num"+this.id)
                    .addClass("instance")
                    .attr("id", this.id)
                    .append($("<div></div>").addClass("name").text(this.name))
                    .css("background-color", "rgb("+(255-stat.layers)+", "+(255-stat.layers)+", "+(255-stat.layers)+")");
    this.element.host = this;
};

//manual overriding
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
    }
    else {
        (this.grown || this.grow());
        this.children.forEach(function(elem) {
            elem.show = true;
        });
        this.opened = true;
    }
    this.display();
};


Instance.prototype.grow = function() {
    var that = this;
    if (this.type.contains !== undefined) {
        this.type.contains.forEach(function(element) {
            that.processString(element).forEach(function(elem) {
                that.addChild(elem);
            });
        });
    }
    this.grown = true;
    stat.layers++;
};

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

Instance.prototype.reveal = function() {
    if (this.show === false) {
        this.element.css("display", "none");
    }
    else {
        this.element.css("display", "block");
    }
};

var collections = {};
collections['planet'] = [];

new Thing("universe", ["galactic supercluster,10-12"]);
new Thing("galactic supercluster", ["galaxy"]);
new Thing("galaxy", ["star system,5-10"]);
collections['planet'].push(new Thing("inhabited telluric planet", ["continent,1-6"], "telluric planet"));
new Thing("star system", ["star", "inhabited telluric planet,1-4"]);


new Thing("continent", [], function(){
    return "continent of "+choose(["Ant", "El", "Am", "In", "Err", "Citro"])
                          +choose(["luria", "alia", "lanta", "ronia", "arus"]);
});

new Thing("star", ["universe"]);

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