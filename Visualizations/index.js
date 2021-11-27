$.ajax({
    method: "GET",
    url: "/Occurrences_Fatalities_Cost_Data",
    success: function(data){
        // Define variables
        let margin = {top: 20, right: 20, bottom: 30, left: 50, xAxis: 60, yAxis: 60, title: 50};
        let width = 1000 - margin.left - margin.right;
        let height = 500 - margin.top - margin.bottom;
        let fatalities_data = [];
        let disaster_types = [];

        //////////////////////////////////////////////////////////////////////////////////////////
        //                                      Process Data                                    //
        //////////////////////////////////////////////////////////////////////////////////////////

        // Process fatalities data
        let fatalities_count_map = {};
        
        data.forEach(d => {
            if(count_map[d.Year] != undefined) {
                count_map[d.Year] += d.Deaths;
            }
            else {
                count_map[d.Year] = 0;
            }
        });

        for (let key in count_map) {
            let item = {"key": key, "value": count_map[key]};
            fatalities_data.push(item);
        }

        // Process disaster types data
        data.forEach(d => {
            if (!disaster_types.includes(d.Disaster)) {
                disaster_types.push(d.Disaster);
            }
        })

        console.log(fatalities_data);

        console.log(disaster_types);

        // // Set the ranges
        // let x = d3.scaleBand().range([0, width]).padding(0.1);
        // let y = d3.scaleLinear().range([height, 0]);

        // let color = d3.scaleOrdinal().domain(disaster_types).range(["#e9c46a", "#2a9d8f", "#8980F5", "#e76f51", "#ADF778"]);

        // // Scale the range of the data in the domains
        // x.domain(fatalities_data.map(d => d.key)); // year
        // y.domain([0, d3.max(fatalities_data, d => d.value)]); // number of fatalities

        // // Create div element to contain chart
        // d3.select('body').append('div')
        //             .attr('id', 'barchartContainer')
        //             .style("text-align", "center");

        // // Create chart div
        // d3.select('#barchartContainer').append('div')
        //             .attr('id', 'barchart');

        // // Barchart SVG
        // let svg = d3.select('#barchart')
        //     .append('svg')
        //     .attr('width', width + margin.left + margin.right + margin.yAxis)
        //     .attr('height', height + margin.top + margin.bottom + margin.xAxis + margin.title)
        //     .append("g")
        //     .attr("transform", 
        //         "translate(" + (margin.left + margin.yAxis) + "," + (margin.top + margin.bottom + margin.title) + ")");

        // // Create bars
        // let bars = svg.selectAll(".bar").data(new_data).enter().append("g").attr('class', 'bar')
        //                 .attr("transform", d => "translate(" + x(getRaceText(d.key)) + "," + y(d.value) + ")");

        // bars.append('rect').attr("width", x.bandwidth()).attr("height", d => height - y(d.value)).attr("id", d => d.key);

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

        // // Create axis
        // svg.append("g")
        //     .attr("transform", d => "translate(0, " + height + ")")
        //     .call(d3.axisBottom(x))
        //     .selectAll("text")
        //     .style("font-size", 14);

        // svg.append("g")
        //     .attr("transform", d => "translate(0, 0)")
        //     .call(d3.axisLeft(y))
        //     .selectAll("text")
        //     .style("font-size", 14);

        // // Add X axis label
        // svg.append("text")
        // .style("font-family", "Times New Roman")
        // .style("font-size", 20)
        // .attr("x", width / 2)
        // .attr("y", height + margin.xAxis)
        // .text("Race");

        // // Y axis label
        // svg.append("text")
        // .style("font-family", "Times New Roman")
        // .style("font-size", 20)
        // .attr("transform", "rotate(-90)")
        // .attr("x", -(height / 2) - (margin.top + margin.xAxis + margin.bottom))
        // .attr("y", -(margin.yAxis + 20))
        // .text("Number of Fatal Shootings");

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