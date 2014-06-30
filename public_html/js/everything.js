// an array of objects that are used to create our instances. 
// {name, contains, callback, collection, dispname} :: {nm, ct, cb, co, dn};
var template = [
    {
        nm: "universe", 
        ct: ["galactic supercluster,10-12"]
    },
    {
        nm: "galactic supercluster", 
        ct: ["galaxy,5-10"]
    },
    {
        nm: "galaxy", 
        ct: ["star system, 10-15"]
    },
    {
        nm: "star system",
        ct: [".planet, 0-5"],
    },
    {
        nm: "inhabited telluric planet",
        dn: "telluric planet",
        ct: ["continent,1-6"],
        co: "planet"
    },
    {
        nm: "continent",
        ct: [".region, 5-10"],
        cb: function() {
            this.dispname = "continent of "+choose(["Ant", "El", "Am", "In", "Err", "Citro"])
                            +choose(["luria", "alia", "lanta", "ronia", "arus"]);
        }
    },
    {
        nm: "dry region",
        co: "region",
        ct: [".land,1-5", ".civilization,0-5"],
        cb: function() {
            this.dispname = util.getDirection() + " " + this.name;
        }
    }
];