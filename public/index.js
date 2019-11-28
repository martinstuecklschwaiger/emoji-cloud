
const width = document.body.clientWidth;
const height = document.body.clientHeight;

const sW = width * 0.9;
const sH = height * 0.9;


fetch("http://example.org/emojis") // TODO add domain
  .then(response => response.json())
  .then(emojis => {

    var layout = d3.layout.cloud()
      .size([width * .9, height * 0.9])
      .words(emojis.map(({emoji, counter}) => ({
        text: emoji,
        size: Math.min(10 + counter * 8, 150),
        test: "haha",
      })))
      .padding(5)
      .fontSize(function(d) { return d.size; })
      .on("end", draw);

    layout.start();


    function draw(words) {
      d3.select("body").append("svg")
        .attr("width", sW)
        .attr("height", sH)
        .attr("viewBox", `0 0 ${sW} ${sH}`)
        .append("g")
        .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")";
        })
        .text(function(d) { return d.text; });
    }

  });
