//create d3 bar chart
function createBarChart(data) {
    var margin = {top: 20, right: 20, bottom: 70, left: 40},
        width = 600 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);
    var y = d3.scale.linear().range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom").ticks(5);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left").ticks(5);

    var svg = d3.select("#barChart")
        .append("svg")
        .attr("id", "barChartSvg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(data.map(function(d) {
        return d.name;
    }));
    y.domain([0, d3.max(data, function(d) {
        return d.value;
    })]);

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")

    g.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")

    g.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .on("mouseover", function(d) {
            d3.select("#barChartSvg")
                .append("text")
                .attr("id", "barChartSvgText")
                .attr("x", function() {
                    return x(d.name) + 10;
                })
                .attr("y", function() {
                    return y(d.value) - 10;
                })
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", "10px")
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .text(function() {
                    return d.value;
                });
        })
        .on("mouseout", function() {
            d3.select("#barChartSvgText").remove();
        })
        .attr("x", function(d) {
            return x(d.name);
        })
        .attr("width", x.rangeBand())
        .attr("y", function(d) {
            return y(d.value);
        })
        .attr("height", function(d) {
            return height - y(d.value);
        });
}

