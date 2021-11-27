function checkIfDeathsForDisasterUndefined(deaths){
    if(deaths != undefined){
        return deaths;
    }
    else {
        return 0;
    }
};

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
                "id": year,
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

        // Set the ranges
        let x = d3.scaleBand().range([0, width]).padding(0.1);
        let y = d3.scaleLinear().range([height, 0]);

        let color = d3.scaleOrdinal().domain(disaster_types).range(["#05698c", "#076d62", "#Ecc63f", "#69f2f5", "#504a64", "#B0e0f9", "#E02203"]);

        // Scale the range of the data in the domains
        x.domain(years); // year d3.extent(years)
        y.domain([0, d3.max(new_data, d => d.All)]); // number of fatalities

        // Create div element to contain chart
        d3.select('body').append('div')
                    .attr('id', 'chartContainer')
                    .style("text-align", "center");

        // Create chart div
        d3.select('#chartContainer').append('div')
                    .attr('id', 'chart');

        // Chart SVG
        let svg = d3.select('#chart')
            .append('svg')
            .attr('width', width + margin.left + margin.right + margin.yAxis)
            .attr('height', height + margin.top + margin.bottom + margin.xAxis + margin.title)
            .append("g")
            .attr("transform", 
                "translate(" + (margin.left + margin.yAxis) + "," + (margin.top + margin.bottom + margin.title) + ")");
        
        // Create bars
        // Create stacked dataset for bar
        let stackedData = d3.stack().keys(disaster_types)(new_data);

        // Create stacked bars
        svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .enter().append("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
            .attr("id", d => d.data.id)
            .attr("x", d => x(d.data.year))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .on("mouseover", (d, i) => { 
                // Change opacity of bar
                d3.select("#" + i.data.id).attr("opacity", "0.5");
    
                // Add bar label
                svg.append("text")
                    .attr("id", "barlabel") // Keep track of the label
                    .attr("x", x(i.data.All) + (x.bandwidth() / 2))
                    .attr("y", y(i[1]) - 10)
                    .text("Fatalities: " + i[1]); 
            });
        // // Create bars
        // let bars = svg.selectAll(".bar").data(data).enter().append("g").attr('class', 'bar')
        //                 .attr("transform", d => "translate(" + x(d.Year) + "," + y(d.Deaths) + ")");

        // bars.append('rect').attr("width", x.bandwidth()).attr("height", d => height - y(d.Deaths)).attr("id", d => d.Year);

        // // Add bar mouse events
        // bars.on("mouseover", (d, i) => { 
        //     // Change opacity of bar
        //     d3.select("#" + i.key).attr("opacity", "0.5");

        //     // Add bar label
        //     svg.append("text")
        //         .attr("id", "barlabel") // Keep track of the label
        //         .attr("x", x(getRaceText(i.key)) + (x.bandwidth() / 2))
        //         .attr("y", y(i.value) - 10)
        //         .text("Fatalities: " + i.value); 
        //     });

        // bars.on("mouseout", (d, i) => { 
        //     // Revert opacity of bar
        //     d3.select("#" + i.key).attr("opacity", "1");

        //     // Remove bar label
        //     d3.select("#barlabel").remove();
        // });

        // Create axis
        svg.append("g")
            .attr("transform", d => "translate(0, " + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", 14);

        svg.append("g")
            .attr("transform", d => "translate(0, 0)")
            .call(d3.axisLeft(y))
            .selectAll("text")
            .style("font-size", 14);

        // Add X axis label
        svg.append("text")
        .style("font-family", "Times New Roman")
        .style("font-size", 20)
        .attr("x", width / 2)
        .attr("y", height + margin.xAxis)
        .text("Year");

        // Y axis label
        svg.append("text")
        .style("font-family", "Times New Roman")
        .style("font-size", 20)
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2) - (margin.top + margin.xAxis + margin.bottom))
        .attr("y", -(margin.yAxis + 20))
        .text("Number of Fatalities");

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