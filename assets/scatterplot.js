let svg = d3.select('svg');



d3.tsv('data/ages/juliet_ages.tsv', function(data) {

    let scaleY = d3.scaleLinear().domain([100, 0]).range([0, 400]);
    console.log(d3.extent(data, role => role['opening_date']).map(date => moment(date).valueOf()));
    let maxMinDates = d3.extent(data, role => role['opening_date']).map(date => moment(date).valueOf())
    let scaleDate = d3.scaleTime().domain(maxMinDates).range([0,595]);
    //let scaleX = d3.scaleTime().domain([new Date(2000, 0, 1), new Date(2000, 0, 2)])
                                //.range([0, 960]);

    data.forEach(function(role) {
        if (role['bday'] != 'person not found on wiki' && role['bday'] != 'no birthday on article' && role['bday'] != 'not a date') {
            console.log(role);
            console.log(moment(role['opening_date']).diff(moment(role['bday']), 'years'));

        }
    });


    svg.selectAll('.performances')
        .data(data)
        .enter()
        .append('circle')
        .attr('stroke', 'black')
        .attr('r', '2px')
        .attr('cx', d => scaleDate(moment(d.opening_date).valueOf()))
        .attr('cy', d => scaleY(moment(d['opening_date']).diff(moment(d['bday']), 'years')));

});
