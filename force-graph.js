import * as d3 from "d3";

// Global variables
let svg, simulation, link, node, text;
let showNames = true;
let width = 1200;
let height = 600;

// Color scale for different groups
const color = d3.scaleOrdinal()
    .domain([1, 2, 3, 4, 5])
    .range(["#ff6b6b", "#4ecdc4", "#45b7d1", "#f7dc6f", "#bb8fce"]);

// Load data and initialize graph
async function init() {
    try {
        const data = await d3.json("./data/main.json");
        createForceGraph(data);
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

function createForceGraph(data) {
    // Clear any existing SVG
    d3.select("#graph").selectAll("*").remove();
    
    // Create SVG
    svg = d3.select("#graph")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("max-width", "100%")
        .style("height", "auto");
    
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            svg.selectAll("g").attr("transform", event.transform);
        });
    
    svg.call(zoom);
    
    // Create container group
    const container = svg.append("g");
    
    // Create links
    link = container.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(data.links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value) * 2)
        .style("opacity", 0.7);
    
    // Create nodes
    node = container.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", 12)
        .attr("fill", d => color(d.group))
        .style("cursor", "pointer")
        .call(drag());
    
    // Add text labels
    text = container.append("g")
        .selectAll("text")
        .data(data.nodes)
        .join("text")
        .text(d => d.name)
        .attr("font-size", "12px")
        .attr("font-family", "Arial, sans-serif")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#333")
        .style("pointer-events", "none")
        .style("font-weight", "bold")
        .style("text-shadow", "1px 1px 2px rgba(255,255,255,0.8)");
    
    // Add hover effects
    node.on("mouseover", function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 16)
            .attr("stroke-width", 3);
        
        // Highlight connected links
        link.style("opacity", l => 
            (l.source === d || l.target === d) ? 1 : 0.2
        );
        
        // Show tooltip
        showTooltip(event, d);
    })
    .on("mouseout", function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr("r", 12)
            .attr("stroke-width", 2);
        
        // Reset link opacity
        link.style("opacity", 0.7);
        
        // Hide tooltip
        hideTooltip();
    });
    
    // Create force simulation
    simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(80))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(20));
    
    // Update positions on each tick
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        
        text
            .attr("x", d => d.x)
            .attr("y", d => d.y - 20);
    });
}

// Drag behavior
function drag() {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

// Tooltip functions
function showTooltip(event, d) {
    const tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("background", "rgba(0,0,0,0.8)")
        .style("color", "white")
        .style("padding", "10px")
        .style("border-radius", "5px")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0);
    
    tooltip.html(`
        <strong>${d.name}</strong><br>
        ID: ${d.id}<br>
        Group: ${d.group}
    `)
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 10) + "px")
    .transition()
    .duration(200)
    .style("opacity", 1);
}

function hideTooltip() {
    d3.selectAll(".tooltip")
        .transition()
        .duration(200)
        .style("opacity", 0)
        .remove();
}

// Control functions
window.restartSimulation = function() {
    simulation.alpha(1).restart();
};

window.toggleNames = function() {
    showNames = !showNames;
    text.style("display", showNames ? "block" : "none");
};

window.centerGraph = function() {
    svg.transition()
        .duration(750)
        .call(
            d3.zoom().transform,
            d3.zoomIdentity.translate(0, 0).scale(1)
        );
};

// Initialize the graph when the page loads
init();
