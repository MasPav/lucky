var padding = {
        top: 20,
        right: 40,
        bottom: 0,
        left: 0
    },
    w = 500 - padding.left - padding.right,
    h = 500 - padding.top - padding.bottom,
    r = Math.min(w, h) / 2,
    rotation = 0,
    oldrotation = 0,
    picked = 100000,
    oldpick = [],
    color = d3.scale.category20();

var data = [{
        id: 1,
        label: "Igor K",
    },
    {
        id: 2,
        label: "Ayeoni M",
    },
    {
        id: 3,
        label: "Ishmael N",
    },
    {
        id: 4,
        label: "Akua A",
    },
    {
        id: 5,
        label: "digital i",
    },
    {
        id: 6,
        label: "Asante T",
    },
    {
        id: 7,
        label: "Mofetoluwa",
    },
    {
        id: 8,
        label: "Godwin K",
    },
    {
        id: 9,
        label: "Nicholas m",
    },
    {
        id: 10,
        label: "mardiya z",
    }

];
var svg, container, vis;
drawChart();

function drawChart() {
    svg = d3.select('#chart')
        .append("svg")
        .data([data])
        .attr("width", w + padding.left + padding.right)
        .attr("height", h + padding.top + padding.bottom)

    container = svg.append("g")
        .attr("class", "chartholder")
        .attr("transform", "translate(" + (w / 2 + padding.left) + "," + (h / 2 + padding.top) + ")");

    vis = container
        .append("g");

    var pie = d3.layout.pie().sort(null).value(function (d) {
        return 1;
    });

    // declare an arc generator function
    var arc = d3.svg.arc().outerRadius(r);

    // select paths, use arc generator to draw
    var arcs = vis.selectAll("g.slice")
        .data(pie)
        .enter()
        .append("g")
        .attr("class", "slice");


    arcs.append("path")
        .attr("fill", function (d, i) {
            return color(i);
        })
        .attr("d", function (d) {
            return arc(d);
        });

    container.on("click", spin);
}

function spin(d) {

    container.on("click", null);
    if (data.length <= 0) {
        console.log("done");
        container.on("click", null);
        return;
    }

    var ps = 360 / data.length,
        pieslice = Math.round(1440 / data.length),
        rng = Math.floor((Math.random() * 1440) + 360);

    rotation = (Math.round(rng / ps) * ps);

    picked = Math.round(data.length - (rotation % 360) / ps);
    picked = picked >= data.length ? (picked % data.length) : picked;

    rotation += 90 - Math.round(ps / 2);

    vis.transition()
        .duration(3000)
        .attrTween("transform", rotTween)
        .each("end", function () {
            oldrotation = rotation;
            container.on("click", spin);
            $('.winner-name').text(data[picked].label);
            $('.winner-wrapper').show();
            data.splice(picked, 1);
        });
}

//draw spin circle
container.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 60)

//spin text
container.append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("SPIN")
    .style({
        "font-weight": "bold",
        "font-size": "30px",
    });

function rotTween(to) {
    var i = d3.interpolate(oldrotation % 360, rotation);
    return function (t) {
        return "rotate(" + i(t) + ")";
    };
}


function getRandomNumbers() {
    var array = new Uint16Array(1000);
    var scale = d3.scale.linear().range([360, 1440]).domain([0, 100000]);

    if (window.hasOwnProperty("crypto") && typeof window.crypto.getRandomValues === "function") {
        window.crypto.getRandomValues(array);
        console.log("works");
    } else {
        //no support for crypto, get crappy random numbers
        for (var i = 0; i < 1000; i++) {
            array[i] = Math.floor(Math.random() * 100000) + 1;
        }
    }

    return array;
}