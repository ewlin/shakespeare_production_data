let svg = d3.select('svg');


d3.tsv('data/ages/lear_ages.tsv', function(data) {

    let scaleY = d3.scaleLinear().domain([100, 0]).range([0, 400]);
    console.log(d3.extent(data, role => role['opening_date']).map(date => moment(date).valueOf()));
    let maxMinDates = d3.extent(data, role => role['opening_date']).map(date => moment(date).valueOf())
    let scaleDate = d3.scaleTime().domain(maxMinDates).range([0,595]);
    //let scaleX = d3.scaleTime().domain([new Date(2000, 0, 1), new Date(2000, 0, 2)])
                                //.range([0, 960]);

    let points = [];

    data.forEach(function(role) {
        if (role['bday'] != 'person not found on wiki' && role['bday'] != 'no birthday on article' && role['bday'] != 'not a date') {
            console.log(role);
            console.log(moment(role['opening_date']).diff(moment(role['bday']), 'years'));
            points.push([scaleDate(moment(role.opening_date).valueOf()), scaleY(moment(role['opening_date']).diff(moment(role['bday']), 'years'))])
        }
    });

    let hull = d3.polygonHull(points);


    // Add the x-axis.
      svg.append("g")
          .attr("class", "x axis")
          //.attr("transform", "translate(0," + 400 + ")")
          .call(d3.axisBottom(scaleDate));

      // Add the y-axis.
      svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + 20 + ",0)")
          .call(d3.axisLeft(scaleY));


    svg.append('path')
        .classed('hull', true)
        .datum(hull)
        .attr("d", function(d) { return "M" + d.join("L") + "Z"; })
        .attr('fill', 'rgba(149, 140, 197, 0.71)')
        .attr('filter', "url(#blurMe)")



    svg.selectAll('.performances')
        .data(data)
        .enter()
        .append('circle')
        .attr('fill', d => d.race ? 'brown' : 'blue')
        .attr('r', '3px')
        .attr('cx', d => scaleDate(moment(d.opening_date).valueOf()))
        .attr('cy', d => scaleY(moment(d['opening_date']).diff(moment(d['bday']), 'years')));

});
