function checkIfDeathsForDisasterUndefined(fatalities) {
    if(fatalities != undefined){
        return fatalities;
    }
    else {
        return 0;
    }
};

function prettifyDisasterType(disaster_type) {
    if (disaster_type == 'Tropical_Cyclone') {
        return 'Tropical Cyclone';
    }
    if ((disaster_type == 'Severe_Storm')) {
        return 'Severe Storm';
    }
    if ((disaster_type == 'Winter_Storm')) {
        return 'Winter Storm';
    }

    return disaster_type;
}

$.ajax({
    method: "GET",
    url: "/Occurrences_Fatalities_Cost_Data",
    success: function(data){
        // Define variables
        let margin = {top: 20, right: 20, bottom: 30, left: 50, xAxis: 60, yAxis: 60, title: 50};
        let width = 1500 - margin.left - margin.right;
        let height = 800 - margin.top - margin.bottom;

        //////////////////////////////////////////////////////////////////////////////////////////
        //                                      Process Data                                    //
        //////////////////////////////////////////////////////////////////////////////////////////
        let disaster_types = ["Flooding", "Tropical_Cyclone", "Drought", "Freeze", "Severe_Storm", "Winter_Storm", "Wildfire"]; //[];
        let years = [];
        let data_map = {};
        let new_data = [];

        // Process list of disaster types and years
        data.forEach(d => {
            // Get list of disasters by type
            // if (!disaster_types.includes(d.Disaster)) {
            //     disaster_types.push(d.Disaster);
            // }

            // Get range of years
            if (!years.includes(d.Year)) {
                years.push(d.Year);
            }
        })

        // Process number of fatalities per disaster type per year
        data.forEach(d => {
            let fatalities_by_disaster_type_map = {};
            // Count number of fatalities per disaster type in the current year
            data.forEach(event => {
                if(event.Year == d.Year) {
                    if(fatalities_by_disaster_type_map[event.Disaster] != undefined) {
                        fatalities_by_disaster_type_map[event.Disaster] += event.Deaths;
                    }
                    else {
                        fatalities_by_disaster_type_map[event.Disaster] = event.Deaths;
                    }
                }
            })

            // Append fatalities per disaster type to the current year
            data_map[d.Year] = fatalities_by_disaster_type_map;
        });

        // Create new pre-processed dataset
        for (let year in data_map) {
            let item = {
                "year": parseInt(year), 
                "Flooding": checkIfDeathsForDisasterUndefined(data_map[year]["Flooding"]), 
                "Tropical_Cyclone": checkIfDeathsForDisasterUndefined(data_map[year]["Tropical Cyclone"]), 
                "Drought": checkIfDeathsForDisasterUndefined(data_map[year]["Drought"]), 
                "Freeze": checkIfDeathsForDisasterUndefined(data_map[year]["Freeze"]), 
                "Severe_Storm": checkIfDeathsForDisasterUndefined(data_map[year]["Severe Storm"]), 
                "Winter_Storm": checkIfDeathsForDisasterUndefined(data_map[year]["Winter Storm"]), 
                "Wildfire": checkIfDeathsForDisasterUndefined(data_map[year]["Wildfire"]), 
                "All": checkIfDeathsForDisasterUndefined(data_map[year]["Flooding"]) +
                        checkIfDeathsForDisasterUndefined(data_map[year]["Tropical Cyclone"]) +
                        checkIfDeathsForDisasterUndefined(data_map[year]["Drought"]) +
                        checkIfDeathsForDisasterUndefined(data_map[year]["Freeze"]) +
                        checkIfDeathsForDisasterUndefined(data_map[year]["Severe Storm"]) +
                        checkIfDeathsForDisasterUndefined(data_map[year]["Winter Storm"]) +
                        checkIfDeathsForDisasterUndefined(data_map[year]["Wildfire"])
                };
            new_data.push(item);
        }

        /////////////////////////////////////////////////////////////////////////////////////////
        //                           Set x and y ranges and domains                            //
        /////////////////////////////////////////////////////////////////////////////////////////

        // Set the ranges
        let x = d3.scaleBand().range([0, width]).padding(0.1);
        let y = d3.scaleLinear().range([height, 0]);

        let color = d3.scaleOrdinal().domain(disaster_types).range(["#05698c", "#076d62", "#Ecc63f", "#69f2f5", "#504a64", "#B0e0f9", "#E02203"]);

        // Scale the range of the data in the domains
        x.domain(years); // year d3.extent(years)
        y.domain([0, d3.max(new_data, d => d.All)]); // number of fatalities

        /////////////////////////////////////////////////////////////////////////////////////////
        //                                Create chart elements                                //
        /////////////////////////////////////////////////////////////////////////////////////////
        let tooltipWidth = 120;
        let tooltipHeight = 60;
        let axisFontSize = 14;

        // Chart SVG
        let svg = d3.select('#chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right + margin.yAxis)
            .attr('height', height + margin.top + margin.bottom + margin.xAxis + margin.title)
            .append("g")
            .attr("transform", 
                "translate(" + (margin.left + margin.yAxis) + "," + (margin.top + margin.bottom + margin.title) + ")");

        // Create axis
        svg.append("g")
            .attr("transform", d => "translate(0, " + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", axisFontSize);

        svg.append("g")
            .attr("transform", d => "translate(0, 0)")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", axisFontSize);

        // Add X axis label
        svg.append("text")
        .attr("class", "axisLabel")
        .attr("x", width / 2)
        .attr("y", height + margin.xAxis)
        .text("Year");

        // Y axis label
        svg.append("text")
        .attr("class", "axisLabel")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2) - (margin.top + margin.xAxis + margin.bottom))
        .attr("y", -(margin.yAxis + 20))
        .text("Number of Fatalities");

        // Create stacked dataset for bar
        let stackedData = d3.stack().keys(disaster_types)(new_data);

        // Create stacked bars group
        let group = svg.selectAll("g.layer")
                        .data(stackedData, d => d.key);

        group.exit().remove();

        group.enter()
            .append("g")
            .classed("layer", true)
            .attr("fill", d => color(d.key))

        let bars = svg.selectAll("g.layer").selectAll("rect")
        .data(d => d, e => e.data.year);

        bars.enter()
            .append("rect")
            .attr("width", x.bandwidth())
            .merge(bars)
            .on("mouseover", (d, i) => {
                // Get the year
                let year = i.data.year;
                // Get number of Floods
                let num_floods = +i.data.Flooding;
                // Get number of Tropical Cyclones
                let num_trop_cyclones = +i.data.Tropical_Cyclone;
                // Get number of Droughts
                let num_droughts = +i.data.Drought;
                // Get number of Freezes
                let num_freezes = +i.data.Freeze;
                // Get number of Severe Storms
                let num_severe_storms = +i.data.Severe_Storm;
                // Get number of Winter Storms
                let num_winter_storms = +i.data.Winter_Storm;
                // Get number of Wildfires
                let num_wildfires = +i.data.Wildfire;
                
                // Evaluate the disaster type by comparing the mouseover data value for i[1] to the number of disasters
                // or 
                // num_floods + num_trop_cyclones + num_droughts + num_freezes + num_severe_storms + num_winter_storms + num_wildfires
                let disaster_type, number_of_fatalities;
                if (i[1] === num_floods){
                    disaster_type = 'Flooding';
                    number_of_fatalities = num_floods;
                }else if (i[1] === num_floods + num_trop_cyclones) {
                    disaster_type = 'Tropical_Cyclone';
                    number_of_fatalities = num_trop_cyclones;
                }else if (i[1] === num_floods + num_trop_cyclones + num_droughts) {
                    disaster_type = 'Drought';
                    number_of_fatalities = num_droughts;
                }else if (i[1] === num_floods + num_trop_cyclones + num_droughts + num_freezes) {
                    disaster_type = 'Freeze';
                    number_of_fatalities = num_freezes;
                }else if (i[1] === num_floods + num_trop_cyclones + num_droughts + num_freezes +num_severe_storms) {
                    disaster_type = 'Severe_Storm';
                    number_of_fatalities = num_severe_storms;
                }else if (i[1] === num_floods + num_trop_cyclones + num_droughts + num_freezes +num_severe_storms + num_winter_storms) {
                    disaster_type = 'Winter_Storm';
                    number_of_fatalities = num_winter_storms;
                }else if (i[1] === num_floods + num_trop_cyclones + num_droughts + num_freezes +num_severe_storms + num_winter_storms + num_wildfires) {
                    disaster_type = 'Wildfire';
                    number_of_fatalities = num_wildfires;
                }

                // Add tooltip SVG
                let tooltip = svg.append("svg").attr("id", "tooltipSVG");

                // Add background for tooltip
                tooltip.append("rect")
                        .attr("class", "tooltip")
                        .attr("width", tooltipWidth)
                        .attr("height", tooltipHeight)
                        .attr("x", d3.pointer(d)[0] - (tooltipWidth / 4))
                        .attr("y", d3.pointer(d)[1] - tooltipHeight);

                // Add text for tooltip
                tooltip.append("text")
                        .attr("class", "tooltipText")
                        .text(year)
                        .attr("x", d3.pointer(d)[0] + (tooltipWidth / 4))
                        .attr("y", d3.pointer(d)[1] - (tooltipHeight / 1.4))
                        .style("font-size", "18px")
                        .style("text-decoration", "underline");

                tooltip.append("text")
                        .attr("class", "tooltipText")
                        .text(prettifyDisasterType(disaster_type))
                        .attr("x", d3.pointer(d)[0] + (tooltipWidth / 4))
                        .attr("y", d3.pointer(d)[1] - (tooltipHeight / 2.5))
                        .style("fill", color(disaster_type))
                        .style("font-size", "14px");

                tooltip.append("text")
                        .attr("class", "tooltipText")
                        .text("Fatalities: " + number_of_fatalities)
                        .attr("x", d3.pointer(d)[0] + (tooltipWidth / 4))
                        .attr("y", d3.pointer(d)[1] - (tooltipHeight / 7))
                        .style("font-size", "14px");

            })
            .on("mouseout", d => {
                svg.select("#tooltipSVG").remove();
            })
            .transition()
            .duration(0)
           .attr("x", d => x(d.data.year))
           .attr("y", d => y(d[1]))
           .attr("height", d => y(d[0]) - y(d[1]));

        bars.exit().remove();

        // // Add chart title
        // svg.append("text")
        // .style("font-family", "Times New Roman")
        // .style("font-size", 24)
        // .attr("text-anchor", "middle")
        // .attr("x", width / 2)
        // .attr("y", -margin.title)
        // .text("Number of Fatal Shootings by Race from 2014 - 2019");
    }
});