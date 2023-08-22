import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

function ThreadProgressBar() {
    const [numberOfThreads, setNumberOfThreads] = useState(1);
    const [threadDuration, setThreadDuration] = useState(10);
    const [threads, setThreads] = useState([]);
    const [nextThreadId, setNextThreadId] = useState(1);
    const [isPaused, setIsPaused] = useState(false);
    const svgRef = useRef();

    useEffect(() => {
        let intervalId = null;
        const tick = () => {
            const newThreads = threads
                .map((thread) => {
                    return {
                        id: thread.id,
                        length: thread.length > 0 ? thread.length - 1 : 0,
                        color: thread.color,
                    };
                })
                .filter((thread) => thread.length > 0)
                .concat(
                    Array.from({ length: numberOfThreads }, (_, index) => {
                        return {
                            id: nextThreadId + index,
                            length: threadDuration,
                            color: getNewColor(),
                        };
                    })
                );

            setThreads(newThreads);
            setNextThreadId(nextThreadId + numberOfThreads);
        };

        if (!isPaused) {
            intervalId = setInterval(tick, 100);
        }

        return () => clearInterval(intervalId);
    }, [numberOfThreads, threadDuration, threads, nextThreadId, isPaused]);


/*    useEffect(() => {
        const svg = d3.select(svgRef.current);

        // create a group element for each thread
        const threadGroups = svg
            .selectAll('g')
            .data(threads, (d) => d.id)
            .join('g')
            .attr('transform', (_, i) => `translate(0, ${i * 15})`);

        // create a rectangle element for each thread
        threadGroups
            .selectAll('rect')
            .data(threads, (d) => [d])
            .join('rect')
            .attr('width', (d) => `${(d.length / threadDuration) * 100}%`)
            .attr('height', '10')
            .attr('fill', (d) => getColor(d.color, d.length));

        // create a text element for each thread
        threadGroups
            .selectAll('text')
            .data((d) => [d])
            .join('text')
            .text((d) => `#${d.id}:${d.length} `)
            .attr('x', -5)
            .attr('y', 7)
            .style('font-size', '10px')
            .style('text-anchor', 'end');
    }, [threads, threadDuration]);

    useEffect(() => {
        const svg = d3.select(svgRef.current);

        const threadsSelection = svg.selectAll('.thread').data(threads, (d) => d.id);

        threadsSelection
            .enter()
            .append('rect')
            .classed('thread', true)
            .attr('width', '0%')
            .attr('height', '5px')
            .attr('y', (d, i) => i * 10 + 5)
            .style('fill', (d) => getColor(d.color, d.length))
            .append('title')
            .text((d) => `#${d.id}`);

        threadsSelection.exit().remove();

        threadsSelection
            .transition()
            .duration(100)
            .attr('width', (d) => `${(d.length / threadDuration) * 100}%`)
            .style('fill', (d) => getColor(d.color, d.length));
    }, [threads, threadDuration]);*/

    const getColor = (originalColor, length) => {
        const brightness = Math.floor((length / threadDuration) * 100);
        return `hsl(${originalColor.hue}, ${originalColor.saturation}%, ${brightness}%)`;
    };

    const getNewColor = () => {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 100;
        return { hue, saturation };
    };

    useEffect(() => {
        // console.log('running effects for ' + threads.length)
        const container = d3.select(svgRef.current);

        container.selectAll('svg').remove();

        const svg = container.append('svg').attr('width', '100%')
            .attr('height', threads.length > 0 ? threads.length * 25 : 0);

        const bars = svg.selectAll('rect').data(threads, (thread) => thread.id);

        bars
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', (thread, index) => index * 7)
            .attr('height', 5)
            .merge(bars)
            .transition()
            .duration(100)
            .attr('width', (thread) => `${(thread.length / threadDuration) * 100}%`)
            .attr('fill', (thread) => getColor(thread.color, thread.length));

        bars.exit().transition().duration(100).attr('width', 0).remove();
    }, [threads]);
    /*useEffect(() => {
        const svg = d3.select(svgRef.current);
        const width = svg.node().clientWidth;
        const height = svg.node().clientHeight;
        const x = d3.scaleLinear()
            .domain([0, threadDuration])
            .range([0, width]);

        svg.selectAll("*").remove();

        svg.selectAll("rect")
            .data(threads, d => d.id)
            .join(
                enter => enter.append("rect")
                    .attr("x", 0)
                    .attr("y", (d, i) => i * 10)
                    .attr("height", 5)
                    .attr("fill", d => getColor(d.color, d.length))
                    .transition()
                    .duration(100)
                    .attr("width", d => x(d.length)),
                update => update
                    .transition()
                    .duration(100)
                    .attr("width", d => x(d.length)),
                exit => exit
                    .transition()
                    .duration(100)
                    .attr("width", 0)
                    .remove()
            );
    }, [threads, threadDuration, getColor]);
    */
    const resetThreads = () => {
        setThreads([]);
        setNextThreadId(1);
    };

    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    const totalThreads = threads.length;

    return (
        <>
        <div>
            <div>Total threads: {totalThreads}</div>
            <button onClick={resetThreads}>Reset threads</button>
            <button onClick={togglePause}>{isPaused ? 'Resume' : 'Pause'}</button>
            <br />
            <label>
                Number of threads:
                <input
                    type="number"
                    value={numberOfThreads}
                    onChange={(event) => setNumberOfThreads(Number(event.target.value))}
                />
            </label>
            <label>
                Thread duration:
                <input
                    type="number"
                    value={threadDuration}
                    onChange={(event) => setThreadDuration(Number(event.target.value))}
                />
            </label>

        </div>
            <div ref={svgRef}></div>
        </>
    );
};

export default ThreadProgressBar;

