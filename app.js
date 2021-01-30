var svg, container, vis;
var padding = {
    top: 20,
    right: 40,
    bottom: 0,
    left: 0,
  },
  w = 600 - padding.left - padding.right,
  h = 600 - padding.top - padding.bottom,
  r = Math.min(w, h) / 2,
  rotation = 0,
  oldrotation = 0,
  picked = 100000,
  oldpick = [],
  color = d3.scale.category20();
var data = [];
var initialData = [];
getRaffleData().then((resData) => {
  data = resData;
  initialData = JSON.stringify(data);
  drawChart();
  $(".spinner-container").removeClass("d-flex").hide();
  $(".raffle-container").show("slow");
});

function getRaffleData() {
  return fetch(
    "https://wismyll6pd.execute-api.eu-west-1.amazonaws.com/prod/getusers"
  )
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        $(".spinner-container").hide();
        $(".alert").show();
      }
    })
    .catch((err) => {
      $(".spinner-container").hide();
      $(".alert").show();
    });
}

function drawChart() {
  d3.select("svg").remove();
  svg = d3
    .select("#chart")
    .append("svg")
    .data([data])
    .attr("width", w + padding.left + padding.right)
    .attr("height", h + padding.top + padding.bottom);

  container = svg
    .append("g")
    .attr("class", "chartholder")
    .attr(
      "transform",
      "translate(" + (w / 2 + padding.left) + "," + (h / 2 + padding.top) + ")"
    );

  vis = container.append("g");

  var pie = d3.layout
    .pie()
    .sort(null)
    .value(function (d) {
      return 1;
    });

  // declare an arc generator function
  var arc = d3.svg.arc().outerRadius(r);

  // select paths, use arc generator to draw
  var arcs = vis
    .selectAll("g.slice")
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "slice");

  arcs
    .append("path")
    .attr("fill", function (d, i) {
      return color(i);
    })
    .attr("d", function (d) {
      return arc(d);
    });

  // add the text
  const fontSize = getFontSize(data);
  arcs
    .append("text")
    .attr("transform", function (d) {
      d.innerRadius = 0;
      d.outerRadius = r;
      d.angle = (d.startAngle + d.endAngle) / 2;
      return (
        "rotate(" +
        ((d.angle * 180) / Math.PI - 90) +
        ")translate(" +
        (d.outerRadius - 10) +
        ")"
      );
    })
    .attr("text-anchor", "end")
    .text(function (d, i) {
      const name = data[i].name;
      return name && name.length <= 10 ? name : `${name.slice(0, 10)}...`;
    })
    .style({
      "font-size": `${fontSize}px`,
    });
  //draw spin circle
  container.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 60);
  //make arrow
  svg
    .append("g")
    .attr(
      "transform",
      "translate(" +
        (w + padding.left + padding.right) +
        "," +
        (h / 2 + padding.top) +
        ")"
    )
    .append("path")
    .attr("d", "M-" + r * 0.15 + ",0L0," + r * 0.05 + "L0,-" + r * 0.05 + "Z")
    .attr("class", "arrow");

  //spin text
  container
    .append("text")
    .attr("x", 0)
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .text("SPIN")
    .style({
      "font-weight": "bold",
      "font-size": "30px",
    });

  container.on("click", spin);
}

function spin(d) {
  container.on("click", null);
  d3.select(".chartholder").style({
    cursor: "not-allowed",
  });
  $(".reset-btn").attr("disabled", true);
  var ps = 360 / data.length,
    pieslice = Math.round(1440 / data.length),
    rng = Math.floor(Math.random() * 1440 + 360);

  rotation = Math.round(rng / ps) * ps;

  picked = Math.round(data.length - (rotation % 360) / ps);
  picked = picked >= data.length ? picked % data.length : picked;

  rotation += 90 - Math.round(ps / 2);

  vis
    .transition()
    .duration(2000)
    .attrTween("transform", rotTween)
    .each("end", function () {
      //mark name as seen
      d3.select(".slice:nth-child(" + (picked + 1) + ") path").attr(
        "fill",
        "#111"
      );
      $(".winner-name").text(data[picked].name);
      $(".winner-wrapper").show("slow");
      $(".fireworks").show("slow");
      setTimeout(() => {
        container.on("click", spin);
        d3.select(".chartholder").style({
          cursor: "pointer",
        });
        $(".fireworks").hide("slow");
        $(".winner-wrapper").hide("slow");
        $(".reset-btn").attr("disabled", false);
        if (data.length <= 1) {
          console.log("done");
          container.on("click", null);
          d3.select(".chartholder").style({
            cursor: "not-allowed",
          });
          $(".raffle-ended").show("slow");
          return;
        }
        drawChart();
      }, 5000);
      data.splice(picked, 1);
    });
}

function getFontSize(data) {
  console.log(data);
  let size = 0;
  if (data.length <= 2) {
    size = 80;
  } else if (data.length <= 3) {
    size = 120;
  } else if (data.length <= 4) {
    size = 150;
  } else if (data.length <= 5) {
    size = 180;
  } else if (data.length <= 6) {
    size = 200;
  } else if (data.length <= 7) {
    size = 230;
  } else if (data.length <= 8) {
    size = 250;
  } else if (data.length <= 9) {
    size = 280;
  } else if (data.length <= 10) {
    size = 300;
  } else if (data.length <= 15) {
    size = 350;
  } else if (data.length <= 15) {
    size = 350;
  } else if (data.length <= 20) {
    size = 400;
  } else if (data.length <= 40) {
    size = 500;
  } else if (data.length <= 80) {
    size = 700;
  }
  return size / data.length;
}
// getSome();

function onReset() {
  $(".raffle-ended").hide("slow");
  data = JSON.parse(initialData);
  drawChart();
}

function getSome() {
  fetch("https://7npi6fj537.execute-api.eu-west-1.amazonaws.com/DEV/dumpconfig")
    .then((res) => res.json())
    .then((data) => console.log(data));
}

function getChartSize() {
  let size = 0;
  if (window.matchMedia("(min-width: 768px)").matches) {
    size = 450;
  } else if (window.matchMedia("(min-width: 992px)").matches) {
    size = 600;
  } else if (window.matchMedia("(min-width: 1280px)").matches) {
    size = 800;
  }
  $(".show").text(size);
  return size;
}

function rotTween(to) {
  var i = d3.interpolate(oldrotation % 360, rotation);
  return function (t) {
    return "rotate(" + i(t) + ")";
  };
}
