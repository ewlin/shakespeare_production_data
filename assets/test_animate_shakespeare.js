let animateStop = false;

d3.csv('../data/shakespeare_outline.csv', function(data) {
    console.log(data);
    console.log(d3.extent(data, d => parseInt(d.x)))
    console.log(d3.extent(data, d => parseInt(d.y)))

    let svg = d3.select('svg');

    svg.selectAll('dots').data(data).enter()
        .append('circle')
        .attr('r', '4px')
        .attr('cx', d => parseInt(d.x))
        .attr('cy', d => parseInt(d.y))
        .attr('fill', () => colors[Math.floor(Math.random() * colorsLength)])
        .attr('fill-opacity', .4);


        /**.each(function(d, i) {
            d3.select(this).node().animate([
                { transform: 'scale(1)', opacity: 1},
                { transform: 'scale(1.5)', opacity: .5 }
            ], {
                duration: 2000, //milliseconds
                easing: 'ease-in-out', //'linear', a bezier curve, etc.
                delay: 10, //milliseconds
                iterations: Infinity, //or a number
                direction: 'alternate', //'normal', 'reverse', etc.
                fill: 'forwards' //'backwards', 'both', 'none', 'auto'
            });
        });**/

        var t = d3.interval(function(elapsed) {
            d3.selectAll('circle').transition().duration(300)
                .attr('r', () => (Math.random() * 3 + 5) + 'px')
                .attr('fill', () => colors[Math.floor(Math.random() * colorsLength)])
                .attr('fill-opacity', d => Math.random());
            if (animateStop == true) t.stop();
            console.log(elapsed);
        }, 500);



});


let colors = ['#c0c400', '#F7973A', '#FC5863', '#F8B535', '#78779E', '#577EAD', '#F57A3E', '#F45C42', '#CA6379', '#FAE12F', '#A96B88'];
let colorsLength = colors.length;
