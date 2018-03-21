let svg = d3.select('svg');

d3.queue()
	.defer(d3.tsv, 'data/ages/lear_ages.tsv')
	.defer(d3.tsv, 'data/ages/hamlet_ages.tsv')
	.defer(d3.tsv, 'data/ages/romeo_ages.tsv')
	.await(function(error, lear, hamlet, romeo) {
	let arr = lear.concat(hamlet, romeo)
	let scaleY = d3.scaleLinear().domain([100, 0]).range([0, 500]);
	let maxMinDates = d3.extent(arr, role => role['opening_date']).map(date => moment(date).valueOf());
	let scaleDate = d3.scaleTime().domain(maxMinDates).range([0,830]);
	createHull(lear, 'orange', scaleDate, scaleY);
	createHull(hamlet, 'blue', scaleDate, scaleY);
	createHull(romeo, '#fc5863', scaleDate, scaleY);
	createScatter(lear, 'orange', scaleDate, scaleY);
	createScatter(hamlet, 'blue', scaleDate, scaleY);
	createScatter(romeo, '#fc5863', scaleDate, scaleY);

});

function createScatter (data, colorScheme, scaleDate, scaleY) {

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



    svg.selectAll('.performances')
        .data(data)
        .enter()
        .append('circle')
        .attr('stroke', d => d.gender == 'female' ? 'white' : 'none')
        .attr('stroke-width', '2px')
        .attr('fill', colorScheme)
        .attr('opacity', .8)
        /**
        .attr('fill', d => {
            if (d.race == 'none') {
                return '#5d7cf8';
            } else if (d.race == 'unknown') {
                return 'grey';
            } else { //Minority?
                return '#710508';
            }
        })
        **/
        //.attr('stroke-width', '2px')
        .attr('r', '5px')
        .attr('cx', d => scaleDate(moment(d.opening_date).valueOf()))
        .attr('cy', d => scaleY(moment(d['opening_date']).diff(moment(d['bday']), 'years')));

    svg.selectAll('.actor-color')
        .data(data)
        .enter()
        .append('circle')
        //.attr('stroke', d => d.gender == 'female' ? 'black' : 'none')
        .attr('fill', d => d.race !== 'none' && d.race !== 'unknown' ? 'brown' : 'none')
        /**
        .attr('fill', d => {
            if (d.race == 'none') {
                return '#5d7cf8';
            } else if (d.race == 'unknown') {
                return 'grey';
            } else { //Minority?
                return '#710508';
            }
        })
        **/
        //.attr('stroke-width', '2px')
        .attr('r', '3px')
        .attr('cx', d => scaleDate(moment(d.opening_date).valueOf()))
        .attr('cy', d => scaleY(moment(d['opening_date']).diff(moment(d['bday']), 'years')));

};

function createHull (data, colorScheme, scaleDate, scaleY) {

    let points = [];

    data.forEach(function(role) {
        if (role['bday'] != 'person not found on wiki'
            && role['bday'] != 'no birthday on article'
            && role['bday'] != 'not a date' && role['actor_flag'] != 'flagged') {
            console.log(role);
            console.log(moment(role['opening_date']).diff(moment(role['bday']), 'years'));
            points.push([scaleDate(moment(role.opening_date).valueOf()), scaleY(moment(role['opening_date']).diff(moment(role['bday']), 'years'))])
        }
    });

    var lineFn = d3.line()
    .curve (d3.curveCatmullRomClosed)
    .x (function(d) { return d[0]; })
    .y (function(d) { return d[1]; });

    let hull = d3.polygonHull(points);
    console.log(hull);

    svg.append('path')
        .classed('hull', true)
        .datum(hull)
        //.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
        .attr('d', d => lineFn(d))
        //.attr('fill', 'rgba(149, 140, 197, 0.71)')
        .attr('opacity', .41)
        .attr('fill', colorScheme)
        .attr('filter', 'url(#blurMe)')
        .attr('mask', 'url(#mask)')
}
