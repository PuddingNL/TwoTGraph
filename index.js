// Global variables
let svg, simulation, link, node, text;
let showNames = true;
let width = 1200;
let height = 600;
let color;

document.addEventListener('DOMContentLoaded', function() {
    
    // Ensure D3 is loaded
    if (typeof d3 === 'undefined') {
        console.error('D3 is not loaded');
        return;
    }

    
    // Color scale for different groups representing Ajahs and factions
    color = d3.scaleOrdinal()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .range([
            "#ff6b6b",  // Group 1: Two Rivers/Main Characters (Red)
            "#4169E1",  // Group 2: Blue Ajah (Royal Blue)
            "#45b7d1",  // Group 3: Gleemen (Light Blue)
            "#98FF98",  // Group 4: Warders (Mint Green)
            "#bb8fce",  // Group 5: Aiel (Purple)
            "#8B4513",  // Group 6: Brown Ajah (Saddle Brown)
            "#228B22",  // Group 7: Green Ajah (Forest Green)
            "#DC143C",  // Group 8: Red Ajah (Crimson)
            "#FFD700",  // Group 9: Amyrlin Seat (Gold)
            "#000000",  // Group 10: Forsaken (Black)
            "#8B4513"   // Group 11: Bela (Brown - she's a horse!)
        ]);

    // Connect the checkbox to toggle status visibility
    const statusToggle = document.getElementById('statusToggle');
    if (statusToggle) {
        statusToggle.addEventListener('change', () => {
            window.showStatus = statusToggle.checked;
        });
    }

    window.showStatus = false; // Default to showing status

    init();
});



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
    
    // Create force simulation
    simulation = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(20));
    
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
        .attr("stroke-width", d => Math.sqrt(d.value) * 2);
    
    // Create nodes
    node = container.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", 12)
        .attr("fill", d => color(d.group))
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            showTooltip(event, d);
        })
        .on("mouseout", function(event, d) {
            const tooltip = d3.select(".tooltip");
            setTimeout(() => {
                if (!tooltip.empty() && !tooltip.node().matches(":hover")) {
                    hideTooltip();
                }
            }, 100); // Reduce delay for better responsiveness
        })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));
    
    // Create text labels
    text = container.append("g")
        .selectAll("text")
        .data(data.nodes)
        .join("text")
        .attr("font-size", "12px")
        .attr("font-family", "Arial, sans-serif")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#333")
        .style("pointer-events", "none")
        .style("font-weight", "bold")
        .style("text-shadow", "1px 1px 2px rgba(255,255,255,0.8)")
        .text(d => showNames ? d.name : "");
    
    // Update positions on each simulation tick
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

// Drag functions
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

// Tooltip functions
function showTooltip(event, d) {
    let tooltip = d3.select(".tooltip");

    // Check if tooltip already exists
    if (tooltip.empty()) {
        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0,0,0,0.8)")
            .style("color", "white")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("font-size", "12px")
            .style("pointer-events", "auto") // Enable pointer events
            .style("opacity", 0);
    }

    tooltip.html(`
        <strong>${d.name}</strong><br>
        Alignment: ${d.alignment}<br>
        Description: ${d.description}<br>
        ${window.showStatus ? `Status: ${d.status}<br>` : ''}
        <a href="https://wot.fandom.com/wiki/${encodeURIComponent(d.name)}" target="_blank" style="color: #fff; text-decoration: underline;">Learn more</a>
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
    text.text(d => showNames ? d.name : "");
};

window.centerGraph = function() {
    // Reset zoom
    svg.transition().duration(750).call(
        d3.zoom().transform,
        d3.zoomIdentity
    );
};

window.toggleAutoRotation = function() {
    // This function is kept for UI consistency but doesn't do anything in 2D mode
    console.log("Auto-rotation is not available in 2D mode");
};

// Add legend click functionality
function addLegendInteraction() {
    const legendItems = d3.selectAll(".legend-item"); // Assuming legend items have this class

    let activeGroup = null; // Track the currently active group

    legendItems.on("click", function(event, d) {
        const group = d3.select(this).attr("data-group"); // Assuming data-group attribute exists

        if (activeGroup === group) {
            // Reset view if the same group is clicked again
            activeGroup = null;
            node.style("opacity", 1);
            link.style("opacity", 1);
        } else {
            // Highlight nodes and links of the selected group
            activeGroup = group;
            node.style("opacity", d => d.group == group ? 1 : 0.2);
            link.style("opacity", l => l.source.group == group || l.target.group == group ? 1 : 0.2);
        }
    });
}

// Call the legend interaction function after creating the graph
addLegendInteraction();
