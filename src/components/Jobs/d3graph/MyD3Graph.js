/** render react-d3-graph
 *
 */
import React from 'react';
import { Graph } from 'react-d3-graph';

// generate array of 300 nodes and edges
const NODE_COUNT = 50;
const nodesList = Array.from({length: NODE_COUNT}, (v, i) => ({id: `Node ${i}`
}));
// generate array of 300 edges with random from and to values between 0 and 300 (inclusive
// of both ends)
const edgesList = Array.from({length: NODE_COUNT}
    , (v, i) => ({source: `Node ${Math.floor(Math.random() * NODE_COUNT)}`, target: `Node ${Math.floor(Math.random() * NODE_COUNT)}`}));

const data = {
    nodes: nodesList,
    links: edgesList
    };

    const graphConfig = {
        "automaticRearrangeAfterDropNode": false,
        "collapsible": false,
        "directed": true,
        "focusAnimationDuration": 0.75,
        "focusZoom": 1,
        "freezeAllDragEvents": false,
        "height": 800,
        "highlightDegree": 1,
        "highlightOpacity": 1,
        "linkHighlightBehavior": false,
        "maxZoom": 8,
        "minZoom": 0.1,
        "nodeHighlightBehavior": false,
        "panAndZoom": false,
        "staticGraph": false,
        "staticGraphWithDragAndDrop": false,
        "width": 1300,
        "d3": {
            "alphaTarget": 0.05,
            "gravity": -100,
            "linkLength": 100,
            "linkStrength": 1,
            "disableLinkForce": false
        },
        "node": {
            "color": "#d3d3d3",
            "fontColor": "black",
            "fontSize": 8,
            "fontWeight": "normal",
            "highlightColor": "SAME",
            "highlightFontSize": 8,
            "highlightFontWeight": "normal",
            "highlightStrokeColor": "SAME",
            "highlightStrokeWidth": "SAME",
            "labelProperty": "id",
            "mouseCursor": "pointer",
            "opacity": 1,
            "renderLabel": true,
            "size": 200,
            "strokeColor": "none",
            "strokeWidth": 1.5,
            "svg": "",
            "symbolType": "square"
        },
        "link": {
            "color": "#d3d3d3",
            "fontColor": "black",
            "fontSize": 8,
            "fontWeight": "normal",
            "highlightColor": "SAME",
            "highlightFontSize": 8,
            "highlightFontWeight": "normal",
            "labelProperty": "label",
            "mouseCursor": "pointer",
            "opacity": 1,
            "renderLabel": false,
            "semanticStrokeWidth": false,
            "strokeWidth": 1.5,
            "markerHeight": 6,
            "markerWidth": 6,
            "strokeDasharray": 0,
            "strokeDashoffset": 0,
            "strokeLinecap": "butt"
        }
    };

export default  () => {
    ;
    return (
        <Graph
            id="graph-id" // id is mandatory
            data={data}
            config={graphConfig}
        />
    );
}
