let svg = d3.select('svg');

function range(a,b) {
    let arr = [];
    for (let i=a; i<b; i++) {
        arr.push(i);
    }
    return arr;
}

d3.queue()
	//.defer(d3.tsv, 'data/ages/rosalind_ages.tsv')
	//.defer(d3.tsv, 'data/ages_updated/portia_actor_ages.tsv')
	.defer(d3.tsv, 'data/ages/shylock_ages.tsv')
	.defer(d3.tsv, 'data/ages_updated/rosalind_actor_ages.tsv')
	//.defer(d3.tsv, 'data/ages/richard_ages.tsv')
	//.defer(d3.tsv, 'data/ages/iago_ages.tsv')
	//.defer(d3.tsv, 'data/ages_updated/miranda_actor_ages.tsv')
	//.defer(d3.tsv, 'data/ages_updated/lady_mac_actor_ages.tsv')
	.defer(d3.tsv, 'data/ages/hamlet_ages.tsv')
	.defer(d3.tsv, 'data/ages/ophelia_ages.tsv')
	.defer(d3.tsv, 'data/ages/antony_ages.tsv')
	.defer(d3.tsv, 'data/ages/cleopatra_ages.tsv')
	.defer(d3.tsv, 'data/ages/romeo_ages.tsv')
	.defer(d3.tsv, 'data/ages/juliet_ages.tsv')
	.defer(d3.tsv, 'data/ages/othello_ages.tsv')
	.defer(d3.tsv, 'data/ages/desdemona_ages.tsv')
	.await(function(error, macbeth, ladyMacbeth, antony, cleopatra, romeo, juliet, hamlet, ophelia, othello, desdemona) {
		//let arr = [].concat(macbeth, ladyMacbeth, antony, cleopatra, romeo, juliet, hamlet, ophelia);
		//possible ages of actors
		let scaleX = d3.scaleLinear().domain([0, 100]).range([0, 1100]);

		let characterAges = {
			romeoAges: {},
			julietAges : {},
			hamletAges : {},
			opheliaAges : {},
			macbethAges: {},
			ladyMacbethAges : {},
			antonyAges : {},
			cleopatraAges : {},
			othelloAges: {},
			desdemonaAges: {}
		};

		let characterAgesArrays = {
			romeoAges: [],
			julietAges : [],
			hamletAges : [],
			opheliaAges : [],
			macbethAges: [],
			ladyMacbethAges : [],
			antonyAges : [],
			cleopatraAges : [],
			othelloAges: [],
			desdemonaAges: []
		}

		processPoints(romeo, 'romeo');
		processPoints(juliet, 'juliet');
		processPoints(hamlet, 'hamlet');
		processPoints(ophelia, 'ophelia');
		processPoints(macbeth, 'macbeth');
		processPoints(ladyMacbeth, 'ladyMacbeth');
		processPoints(antony, 'antony');
		processPoints(cleopatra, 'cleopatra');
		processPoints(othello, 'othello');
		processPoints(desdemona, 'desdemona');


		function processPoints(characterData, character) {
			characterData.forEach(function(role) {
		        if (role['bday'] != 'person not found on wiki'
		            && role['bday'] != 'no birthday on article'
		            && role['bday'] != 'not a date' && role['actor_flag'] != 'flagged') {

					let age = moment(role['opening_date']).diff(moment(role['bday']), 'years');
		            //romeoPoints.push(scaleY(moment(role['opening_date']).diff(moment(role['bday']), 'years')))
					if (age > 0) {
						if (characterAges[character + 'Ages'][age]) {
							characterAges[character + 'Ages'][age].push(role)
						} else {
							characterAges[character + 'Ages'][age] = [role]
						}
						characterAgesArrays[character + 'Ages'].push(age);
					}

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
    		.y1(function(d) { return scaleY(d[1]); })
			.y0(function(d) { return scaleY(0); });

		let macbethAgesArray = [];
		for (age in characterAges.macbethAges) {
			macbethAgesArray.push([age, characterAges.macbethAges[age].length])
		}

		//console.log(hamletAgesArray);
		//console.log(romeoAgesArray)


		let ladyMacbethAgesArray = [];
		for (age in characterAges.ladyMacbethAges) {
			ladyMacbethAgesArray.push([age, characterAges.ladyMacbethAges[age].length])
		}

		let newArr = function(array) {
			let newA = [];
			range(1,100).forEach(integer => {
				let intStr = integer.toString();
				let found = array.findIndex(ele => ele[0] == intStr);
				if (found != -1) {
					newA.push(array[found]);
				} else {
					newA.push([integer.toString(), 0]);
				}
			});
			return newA;
		}

		//console.log(newArr(macbethAgesArray))
		//console.log(newArr(othelloAgesArray))
		let newMacbeth = newArr(macbethAgesArray);
		let newLadyMac = newArr(ladyMacbethAgesArray);
		console.log(newMacbeth.length, newLadyMac.length)
		//console.log(romeoAgesArray)
		svg.append('path')
			.datum(newMacbeth)
			.attr('d', d => area(d))
			.attr('fill', 'steelblue')
			.attr('stroke', 'steelblue')
			.attr('fill-opacity', .4);


		svg.selectAll('.ages')
			.data(newMacbeth)
			.enter()
			.append('circle')
			.attr('cx', d => scaleX(parseInt(d[0])))
			.attr('cy', d => scaleY(d[1]))
			.attr('r', '2px')
			//.attr('d', d => line(d))
			.attr('fill', 'none')
			.attr('stroke', 'steelblue');

		svg.append('path')
			.datum(newLadyMac)
			.attr('d', d => area(d))
			.attr('fill', '#fc5863')
			.attr('stroke', '#fc5863')
			.attr('fill-opacity', .4);

		svg.selectAll('.ages')
			.data(newLadyMac)
			.enter()
			.append('circle')
			.attr('cx', d => scaleX(parseInt(d[0])))
			.attr('cy', d => scaleY(d[1]))
			.attr('r', '2px')
			//.attr('d', d => line(d))
			.attr('fill', '#fc5863')
			.attr('stroke', '#fc5863')


		console.log(d3.quantile(characterAgesArrays['macbethAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['macbethAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['ladyMacbethAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['ladyMacbethAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['antonyAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['antonyAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['cleopatraAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['cleopatraAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['othelloAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['othelloAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['desdemonaAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['desdemonaAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['romeoAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['romeoAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['julietAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['julietAges'].sort(), .75))


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
