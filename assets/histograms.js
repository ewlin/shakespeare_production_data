let svg = d3.select('svg');

d3.queue()
	//.defer(d3.tsv, 'data/ages/lear_ages.tsv')
	//.defer(d3.tsv, 'data/ages/hamlet_ages.tsv')
	//.defer(d3.tsv, 'data/ages/romeo_ages.tsv')
	//.await(function(error, lear, hamlet, romeo) {
	//let arr = lear.concat(hamlet, romeo)
	.defer(d3.tsv, 'data/ages/lear_ages.tsv')
	.defer(d3.tsv, 'data/ages/desdemona_ages.tsv')
	.defer(d3.tsv, 'data/ages/macbeth_ages.tsv')
	.defer(d3.tsv, 'data/ages/lady_macbeth_ages.tsv')
	.defer(d3.tsv, 'data/ages/romeo_ages.tsv')
	.defer(d3.tsv, 'data/ages/juliet_ages.tsv')
	.defer(d3.tsv, 'data/ages/hamlet_ages.tsv')
	.defer(d3.tsv, 'data/ages/ophelia_ages.tsv')
	.await(function(error, romeo, juliet, hamlet, ophelia, macbeth, ladyMacbeth, othello, desdemona) {
		let arr = [].concat(romeo, juliet, hamlet, ophelia, macbeth, ladyMacbeth, othello, desdemona);
		//possible ages of actors
		let scaleX = d3.scaleLinear().domain([0, 100]).range([0, 1100]);

		let characterAges = {
			romeoAges: {},
			julietAges : {},
			hamletAges : {},
			opheliaAges : {},
			macbethAges: {},
			ladyMacbethAges : {},
			othelloAges : {},
			desdemonaAges : {}
		};

		let characterAgesArrays = {
			romeoAges: [],
			julietAges : [],
			hamletAges : [],
			opheliaAges : [],
			macbethAges: [],
			ladyMacbethAges : [],
			othelloAges : [],
			desdemonaAges : []
		}

		processPoints(romeo, 'romeo');
		processPoints(juliet, 'juliet');
		processPoints(hamlet, 'hamlet');
		processPoints(ophelia, 'ophelia');
		processPoints(macbeth, 'macbeth');
		processPoints(ladyMacbeth, 'ladyMacbeth');
		processPoints(othello, 'othello');
		processPoints(desdemona, 'desdemona');

		function processPoints(characterData, character) {
			characterData.forEach(function(role) {
		        if (role['bday'] != 'person not found on wiki'
		            && role['bday'] != 'no birthday on article'
		            && role['bday'] != 'not a date' && role['actor_flag'] != 'flagged') {

					let age = moment(role['opening_date']).diff(moment(role['bday']), 'years');
		            //romeoPoints.push(scaleY(moment(role['opening_date']).diff(moment(role['bday']), 'years')))
					if (characterAges[character + 'Ages'][age]) {
						characterAges[character + 'Ages'][age].push(role)
					} else {
						characterAges[character + 'Ages'][age] = [role]
					}
					characterAgesArrays[character + 'Ages'].push(age);
		        }
		    });
		}

		console.log(characterAges);
		let allAgesFreqs = [];
		for (character in characterAges) {
			//let ages = Object.keys(characterAges[character]);
			for (age in characterAges[character]) {
				let freq = characterAges[character][age].length;
				allAgesFreqs.push(freq);
			}
		}


		//let maxMinDates = d3.extent(arr, role => role['opening_date']).map(date => moment(date).valueOf());
		let maxMinAgeFreqs = d3.extent(allAgesFreqs);
		console.log(maxMinAgeFreqs)
		let scaleY = d3.scaleLinear().domain([0, 15]).range([330, 0]);

		var area = d3.area()
			.curve(d3.curveCatmullRom)
    		.x(function(d) { return scaleX(parseInt(d[0])); })
    		.y(function(d) { return scaleY(d[1]); });

		let hamletAgesArray = [];
		for (age in characterAges.hamletAges) {
			hamletAgesArray.push([age, characterAges.hamletAges[age].length])
		}

		//console.log(romeoAgesArray)


		let opheliaAgesArray = [];
		for (age in characterAges.opheliaAges) {
			opheliaAgesArray.push([age, characterAges.opheliaAges[age].length])
		}

		//console.log(romeoAgesArray)
		svg.append('path')
			.datum(hamletAgesArray)
			.attr('d', d => area(d))
			.attr('fill', 'steelblue')
			.attr('stroke', 'steelblue')

		svg.selectAll('.ages')
			.data(hamletAgesArray)
			.enter()
			.append('circle')
			.attr('cx', d => scaleX(parseInt(d[0])))
			.attr('cy', d => scaleY(d[1]))
			.attr('r', '2px')
			//.attr('d', d => line(d))
			.attr('fill', 'none')
			.attr('stroke', 'steelblue')

		svg.append('path')
			.datum(opheliaAgesArray)
			.attr('d', d => area(d))
			.attr('fill', '#fc5863')
			.attr('stroke', '#fc5863')

		svg.selectAll('.ages')
			.data(opheliaAgesArray)
			.enter()
			.append('circle')
			.attr('cx', d => scaleX(parseInt(d[0])))
			.attr('cy', d => scaleY(d[1]))
			.attr('r', '2px')
			//.attr('d', d => line(d))
			.attr('fill', '#fc5863')
			.attr('stroke', '#fc5863')

		console.log(d3.quantile(characterAgesArrays['romeoAges'].sort(), .20))
		console.log(d3.quantile(characterAgesArrays['romeoAges'].sort(), .8))
		console.log(d3.quantile(characterAgesArrays['julietAges'].sort(), .2))
		console.log(d3.quantile(characterAgesArrays['julietAges'].sort(), .80))
		console.log(d3.quantile(characterAgesArrays['hamletAges'].sort(), .2))
		console.log(d3.quantile(characterAgesArrays['hamletAges'].sort(), .8))
		console.log(d3.quantile(characterAgesArrays['opheliaAges'].sort(), .2))
		console.log(d3.quantile(characterAgesArrays['opheliaAges'].sort(), .8))

			/**

		console.log(characterAgesArrays['macbethAges'].sort())
		console.log(d3.quantile(characterAgesArrays['othelloAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['othelloAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['ladyMacbethAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['ladyMacbethAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['hamletAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['hamletAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['opheliaAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['opheliaAges'].sort(), .75))

		**/




	});
