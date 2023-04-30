import React, {useEffect, useRef} from "react";
import graphlib from "graphlib"
import * as d3 from "d3";
import * as dagreD3 from 'dagre-d3';
import * as dagre from "dagre";
import TreeGraph from "./TreeGraph";


// import d3 from 'd3'
// const graphlib = require('graphlib');
// const d3 = require('d3');

export const Graphold = () => {
// Define the dependencies
const linearList = [
    { id: 'A', dependencies: ['B', 'C'] },
    { id: 'B', dependencies: ['D'] },
    { id: 'C', dependencies: [] },
    { id: 'D', dependencies: [] },
];

// Create a new graph object
const graph = new graphlib.Graph();

// Add nodes to the graph
for (const item of linearList) {
    graph.setNode(item.id);
}

// Add edges to the graph
for (const item of linearList) {
    for (const dep of item.dependencies) {
        graph.setEdge(dep, item.id);
    }
}

// Check the graph for cycles
if (graphlib.alg.isAcyclic(graph)) {
    // Use d3 to display the graph
    const svg = d3.select('body').append('svg').attr('width', 400).attr('height', 300);
    const render = new dagreD3.render();
    render(svg, graph);
} else {
    console.error('Invalid dependencies: graph contains cycles');
}

return (
        <div>graph</div>
    )
}



function MyChart() {
    const chartRef = useRef(null);

    useEffect(() => {
        const data = [10, 20, 30, 40, 50, 89, 99];

        const svg = d3.select(chartRef.current)
            .append("svg")
            .attr("width", 1200)
            .attr("height", 200);

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => i * 90)
            .attr("y", (d, i) => 200 - 10 * d)
            .attr("width", 50)
            .attr("height", (d, i) => d * 10)
            .attr("fill", "blue");
    }, []);

    return <div ref={chartRef}></div>;
}

export const Graph = ()=> {
    return (
        <>
            <TreeGraph />
        <MyChart/>
        <KafkaFlow />
        </>
    )
}
class KafkaFlow extends React.Component {
    constructor() {
        super();
    }

    componentDidMount() {
        // Create the input graph
        let g = new dagreD3.graphlib.Graph().setGraph({});
        // Set an object for the graph label
        g.setGraph({});

        // Default to assigning a new object as a label for each new edge.
        g.setDefaultEdgeLabel(function () {
            return {};
        });

        // Add nodes to the graph. The first argument is the node id. The second is
        // metadata about the node. In this case we're going to add labels to each of
        // our nodes.
        g.setNode("kspacey", { label: "Kevin Spacey", width: 144, height: 100, style: "fill: #afa"  });
        g.setNode("swilliams", { label: "Saul Williams", width: 160, height: 100 });
        g.setNode("bpitt", { label: "Brad Pitt", width: 108, height: 100 });
        g.setNode("hford", { label: "Harrison Ford", width: 168, height: 100 });
        g.setNode("lwilson", { label: "Luke Wilson", width: 144, height: 100 });
        g.setNode("kbacon", { label: "Kevin Bacon", width: 121, height: 100 });

        // Add edges to the graph.
        g.setEdge("kspacey", "swilliams");
        g.setEdge("swilliams", "kbacon");
        g.setEdge("bpitt", "kbacon");
        g.setEdge("hford", "lwilson");
        g.setEdge("lwilson", "kbacon");

        // don't know where is dagre coming from
        dagre.layout(g);

        // Create the renderer
        let render = new dagreD3.render();

        // Set up an SVG group so that we can translate the final graph.
        let svg = d3.select(this.nodeTree);

        // Run the renderer. This is what draws the final graph.
        render(d3.select(this.nodeTreeGroup), g);

        svg.attr("height", g.graph().height + 40);
    }

    render() {
        return (
            <svg
                id="nodeTree"
                ref={(ref) => { this.nodeTree = ref; }}
                width="960"
                height="600"
            >
                <g ref={(r) => { this.nodeTreeGroup = r; }} />
            </svg>
        );
    }
}
function MyTree() {

/*
const chart = Tree(flare, {
    label: d => d.name,
    title: (d, n) => `${n.ancestors().reverse().map(d => d.data.name).join(".")}`, // hover text
    link: (d, n) => `https://github.com/prefuse/Flare/${n.children ? "tree" : "blob"}/master/flare/src/${n.ancestors().reverse().map(d => d.data.name).join("/")}${n.children ? "" : ".as"}`,
    width: 1152
})
*/
}



