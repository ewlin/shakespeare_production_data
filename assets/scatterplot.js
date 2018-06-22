let svg = d3.select('svg');

var lineFn = d3.line()
.curve (d3.curveCatmullRomClosed)
.x (function(d) { return d[0]; })
.y (function(d) { return d[1]; });


d3.queue()
	//.defer(d3.tsv, 'data/ages/lear_ages.tsv')
	//.defer(d3.tsv, 'data/ages/hamlet_ages.tsv')
	//.defer(d3.tsv, 'data/ages/romeo_ages.tsv')
	//.await(function(error, lear, hamlet, romeo) {
	//let arr = lear.concat(hamlet, romeo)
	.defer(d3.tsv, 'data/ages/othello_ages.tsv')
	//.defer(d3.tsv, 'data/ages/romeo_ages.tsv')
	.defer(d3.tsv, 'data/ages/juliet_ages.tsv')
	.defer(d3.tsv, 'data/ages/macbeth_ages.tsv')
	.defer(d3.tsv, 'data/ages_updated/portia_actor_ages.tsv')
	.defer(d3.tsv, 'data/ages/ophelia_ages.tsv')
	.defer(d3.tsv, 'data/ages/macbeth_ages.tsv')
	.defer(d3.tsv, 'data/ages/lady_macbeth_ages.tsv')
	.defer(d3.tsv, 'data/ages/othello_ages.tsv')
	.defer(d3.tsv, 'data/ages/desdemona_ages.tsv')
	.await(function(error, romeo, juliet, hamlet, ophelia) {
		let arr = [].concat(romeo, juliet, hamlet, ophelia);
		let scaleY = d3.scaleLinear().domain([100, 0]).range([0, 500]);
		let maxMinDates = d3.extent(arr, role => role['opening_date']).map(date => moment(date).valueOf());
		let scaleDate = d3.scaleTime().domain(maxMinDates).range([0,830]);
		/**
		createHull(lear, 'orange', scaleDate, scaleY);
		createHull(hamlet, 'blue', scaleDate, scaleY);
		createHull(romeo, '#fc5863', scaleDate, scaleY);
		createScatter(lear, 'orange', scaleDate, scaleY);
		createScatter(hamlet, 'blue', scaleDate, scaleY);
		createScatter(romeo, '#fc5863', scaleDate, scaleY);
		**/
		createHull(ophelia, '#fc5863', scaleDate, scaleY, 'ophelia');
		createHull(hamlet, 'orange', scaleDate, scaleY, 'hamlet');
		createScatter(ophelia, '#fc5863', scaleDate, scaleY, 'ophelia', 'group0');
		createScatter(hamlet, 'orange', scaleDate, scaleY, 'hamlet', 'group1');

		let romeoPoints = [];
		let julietPoints = [];

	    romeo.forEach(function(role) {
	        if (role['bday'] != 'person not found on wiki'
	            && role['bday'] != 'no birthday on article'
	            && role['bday'] != 'not a date' && role['actor_flag'] != 'flagged') {
	            //console.log(role);
	            //console.log(moment(role['opening_date']).diff(moment(role['bday']), 'years'));
	            romeoPoints.push([scaleDate(moment(role.opening_date).valueOf()), scaleY(moment(role['opening_date']).diff(moment(role['bday']), 'years'))])
	        }
	    });

		juliet.forEach(function(role) {
	        if (role['bday'] != 'person not found on wiki'
	            && role['bday'] != 'no birthday on article'
	            && role['bday'] != 'not a date' && role['actor_flag'] != 'flagged') {
	            //console.log(role);
	            //console.log(moment(role['opening_date']).diff(moment(role['bday']), 'years'));
	            julietPoints.push([scaleDate(moment(role.opening_date).valueOf()), scaleY(moment(role['opening_date']).diff(moment(role['bday']), 'years'))])
	        }
	    });

		//console.log(julietPoints)

		var lineFn = d3.line()
		.curve (d3.curveCatmullRomClosed)
		.x (function(d) { return d[0]; })
		.y (function(d) { return d[1]; });

	    let rHull = d3.polygonHull(romeoPoints)//.sort((a,b) => a[0] - b[0]);
		let jHull = d3.polygonHull(julietPoints)//.sort((a,b) => a[0] - b[0]);

		console.log(jHull)

		let transitionA = d3.transition().duration(2500).ease(d3.easeElasticIn);
		let transitionB = d3.transition().duration(2100).ease(d3.easeElasticIn);
		let transitionC = d3.transition().duration(1500);

		d3.select('.transition')
			.on('click', function() {
				d3.selectAll('.outer-circle')
						.transition(d3.transition().duration(2500).ease(d3.easeElasticIn))
						.attr('r', d => d.race !== 'none' && d.race !== 'unknown' ? '9px' : '5px')
						.attr('opacity', d => d.race !== 'none' && d.race !== 'unknown' ? 1 : .5)
			});

		d3.select('.hull-tran')
			.on('click', function() {
				svg.selectAll('.inner-circle').remove();

				svg.select('path.hamlet')
					.datum(rHull)
					.transition(d3.transition().duration(2800))
					.attr('d', d => lineFn(d))
					//.attr('fill', 'steelblue')
/**
				svg.select('path.desdemona')
					.datum(jHull)
					.transition(d3.transition().duration(3800))
					.attr('d', d => lineFn(d))
					**/

				let circles = svg.selectAll('circle.group1')
					.data(romeo);

				//let circles2 = d3.selectAll('circle.desdemona')
					//.data(juliet);

				circles.exit().remove();
				//circles2.exit().remove();
				//circles2.enter().append('circle').classed('outer-circle juliet', true)

				circles.transition().duration(2100)
					.attr('cx', d => scaleDate(moment(d.opening_date).valueOf()))
					.attr('cy', d => scaleY(moment(d['opening_date']).diff(moment(d['bday']), 'years')))
					.attr('fill', 'steelblue')
					.attr('opacity', .8)

				circles.enter().append('circle').attr('stroke', d => d.gender == 'female' ? 'white' : 'none')
		        	.attr('stroke-width', '2px')
		        	.attr('fill', 'steelblue')
		        	.attr('opacity', 0)
		        	.attr('r', '5px')
		        	.attr('cx', d => scaleDate(moment(d.opening_date).valueOf()))
		        	.attr('cy', d => scaleY(moment(d['opening_date']).diff(moment(d['bday']), 'years')))
					.transition().duration(2100)
					.attr('opacity', .8)





				//.classed('outer-circle romeo group1', true)

				//circles2.transition().duration(2100)
					//.attr('cx', d => scaleDate(moment(d.opening_date).valueOf()))
					//.attr('cy', d => scaleY(moment(d['opening_date']).diff(moment(d['bday']), 'years')))

			});
});

function createScatter (data, colorScheme, scaleDate, scaleY, character, group) {

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
		.classed('outer-circle ' + character + ' ' + group, true)
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


    //svg.selectAll('.actor-color')
    //    .data(data)
    //    .enter()
    //    .append('circle')
		//.classed('inner-circle ' + character, true)
    //    //.attr('stroke', d => d.gender == 'female' ? 'black' : 'none')
    //    .attr('fill', d => d.race !== 'none' && d.race !== 'unknown' ? 'brown' : 'none')
    //    /**
    //    .attr('fill', d => {
    //        if (d.race == 'none') {
    //            return '#5d7cf8';
    //        } else if (d.race == 'unknown') {
    //            return 'grey';
    //        } else { //Minority?
    //            return '#710508';
    //        }
    //    })
    //    **/
    //    //.attr('stroke-width', '2px')
    //    .attr('r', '3px')
    //    .attr('cx', d => scaleDate(moment(d.opening_date).valueOf()))
    //    .attr('cy', d => scaleY(moment(d['opening_date']).diff(moment(d['bday']), 'years')));

};

function createHull (data, colorScheme, scaleDate, scaleY, character) {

    let points = [];

    data.forEach(function(role) {
        if (role['bday'] != 'person not found on wiki'
            && role['bday'] != 'no birthday on article'
            && role['bday'] != 'not a date' && role['actor_flag'] != 'flagged') {
            //console.log(role);
            //console.log(moment(role['opening_date']).diff(moment(role['bday']), 'years'));
            points.push([scaleDate(moment(role.opening_date).valueOf()), scaleY(moment(role['opening_date']).diff(moment(role['bday']), 'years'))])
        }
    });
	var lineFn = d3.line()
	.curve (d3.curveCatmullRomClosed)
	.x (function(d) { return d[0]; })
	.y (function(d) { return d[1]; });

    let hull = d3.polygonHull(points)//.sort((a,b) => a[0] - b[0]);
	console.log(character);
	console.log(hull);

    svg.append('path')
        .classed('hull ' + character, true)
        .datum(hull)
        //.attr("d", function(d) { return "M" + d.join("L") + "Z"; })
        .attr('d', d => lineFn(d))
        .attr('fill', 'none')
        .attr('opacity', .41)
        //.attr('fill', colorScheme)
		.attr('stroke', 'black')
        //.attr('filter', 'url(#blurMe)')
        //.attr('mask', 'url(#mask)')
}
