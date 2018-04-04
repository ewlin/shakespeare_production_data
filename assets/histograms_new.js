let svg = d3.select('svg');

function range(a,b) {
    let arr = [];
    for (let i=a; i<b; i++) {
        arr.push(i);
    }
    return arr;
}

d3.queue()
	//.defer(d3.tsv, 'data/ages_updated/richard_iii_actor_ages.tsv')
	//.defer(d3.tsv, 'data/ages_updated/portia_actor_ages.tsv')
	//.defer(d3.tsv, 'data/ages/shylock_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/iago_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages/othello_ages.tsv')
    .defer(d3.tsv, 'data/ages/desdemona_ages.tsv')
	//.defer(d3.tsv, 'data/ages_updated/rosalind_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/macbeth_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/lady_mac_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/cleopatra_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages/shylock_ages.tsv')
	.await(function(error, iago, othello, desdemona, macbeth, ladyMacbeth, cleopatra, shylock) {
		let scaleX = d3.scaleLinear().domain([0, 100]).range([0, 1100]);
		let characterAges = {
            /**
            hamletAges: {},
			portiaAges: {},
   	        shylockAges: {},
   	        rosalindAges: {},

            **/
            iagoAges: {},
            othelloAges: {},
            desdemonaAges: {},
            macbethAges: {},
   	        ladyMacbethAges: {},
            cleopatraAges: {},
            shylockAges: {}
		};

		let characterAgesArrays = {
            /**
            hamletAges: [],
			portiaAges : [],
			shylockAges : [],
			rosalindAges: [],
			macbethAges: [],
			ladyMacbethAges : [],
            **/
            iagoAges: [],
            othelloAges: [],
            desdemonaAges: [],
            macbethAges: [],
			ladyMacbethAges : [],
            cleopatraAges: [],
            shylockAges : []

		}

		processPoints(iago, 'iago');
        processPoints(othello, 'othello');
        processPoints(desdemona, 'desdemona');
        processPoints(macbeth, 'macbeth');
        processPoints(ladyMacbeth, 'ladyMacbeth');
        processPoints(cleopatra, 'cleopatra');
        processPoints(cleopatra, 'cleopatra');
        processPoints(shylock, 'shylock');

		function processPoints(characterData, character) {
			characterData.forEach(function(role) {
				if (role['bday'] != 'person not found on wiki'
						&& role['bday'] != 'no birthday on article'
						&& role['bday'] != 'not a date' && role['actor_flag'] != 'flagged') {

					let age = moment(role['opening_date']).diff(moment(role['bday']), 'years');
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

		//Find max freq of roles at each age
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
		let scaleY = d3.scaleLinear().domain([0, maxMinAgeFreqs[1]]).range([330, 0]);

		var area = d3.area()
			.curve(d3.curveCatmullRom)
    	    .x(function(d) { return scaleX(parseInt(d[0])); })
    	    .y1(function(d) { return scaleY(d[1]); })
			.y0(function(d) { return scaleY(0); });

		characterAgeHistogram(characterAges.iagoAges, 'steelblue');
        characterAgeHistogram(characterAges.othelloAges, 'orange');
		//characterAgeHistogram(characterAges.ladyMacbethAges, '#c73683');
		//characterAgeHistogram(characterAges.rosalindAges, '#fc5863');
		characterAgeHistogram(characterAges.desdemonaAges, '#fc5863'); //#fa5fb2');
		//characterAgeHistogram(characterAges.shylockAges, '#5888b0');


		function characterAgeHistogram(charAges, color) {
			let characterAgesArray = [];
			for (age in charAges) {
				characterAgesArray.push([age, charAges[age].length])
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

			let newCharArray = newArr(characterAgesArray);

			svg.append('path')
				.datum(newCharArray)
				.attr('d', d => area(d))
				.attr('fill', color)
				.attr('stroke', color)
				.attr('fill-opacity', .7);


			svg.selectAll('.ages')
				.data(newCharArray)
				.enter()
				.append('circle')
				.attr('cx', d => scaleX(parseInt(d[0])))
				.attr('cy', d => scaleY(d[1]))
				.attr('r', '2px')
				//.attr('d', d => line(d))
				.attr('fill', color)
				.attr('stroke', color);
		}



		//let macbethAgesArray = [];
		//for (age in characterAges.macbethAges) {
		//	macbethAgesArray.push([age, characterAges.macbethAges[age].length])
		//}
//
		////console.log(hamletAgesArray);
		////console.log(romeoAgesArray)
//
//
		//let ladyMacbethAgesArray = [];
		//for (age in characterAges.ladyMacbethAges) {
		//	ladyMacbethAgesArray.push([age, characterAges.ladyMacbethAges[age].length])
		//}
//
		//let newArr = function(array) {
		//	let newA = [];
		//	range(1,100).forEach(integer => {
		//		let intStr = integer.toString();
		//		let found = array.findIndex(ele => ele[0] == intStr);
		//		if (found != -1) {
		//			newA.push(array[found]);
		//		} else {
		//			newA.push([integer.toString(), 0]);
		//		}
		//	});
		//	return newA;
		//}
//
		////console.log(newArr(macbethAgesArray))
		////console.log(newArr(othelloAgesArray))
		//let newMacbeth = newArr(macbethAgesArray);
		//let newLadyMac = newArr(ladyMacbethAgesArray);
		//console.log(newMacbeth.length, newLadyMac.length)
		////console.log(romeoAgesArray)
		//svg.append('path')
		//	.datum(newMacbeth)
		//	.attr('d', d => area(d))
		//	.attr('fill', 'steelblue')
		//	.attr('stroke', 'steelblue')
		//	.attr('fill-opacity', .4);
//
//
		//svg.selectAll('.ages')
		//	.data(newMacbeth)
		//	.enter()
		//	.append('circle')
		//	.attr('cx', d => scaleX(parseInt(d[0])))
		//	.attr('cy', d => scaleY(d[1]))
		//	.attr('r', '2px')
		//	//.attr('d', d => line(d))
		//	.attr('fill', 'none')
		//	.attr('stroke', 'steelblue');
//
		//svg.append('path')
		//	.datum(newLadyMac)
		//	.attr('d', d => area(d))
		//	.attr('fill', '#fc5863')
		//	.attr('stroke', '#fc5863')
		//	.attr('fill-opacity', .4);
//
		//svg.selectAll('.ages')
		//	.data(newLadyMac)
		//	.enter()
		//	.append('circle')
		//	.attr('cx', d => scaleX(parseInt(d[0])))
		//	.attr('cy', d => scaleY(d[1]))
		//	.attr('r', '2px')
		//	//.attr('d', d => line(d))
		//	.attr('fill', '#fc5863')
		//	.attr('stroke', '#fc5863')

        /**
		console.log(d3.quantile(characterAgesArrays['macbethAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['macbethAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['ladyMacbethAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['ladyMacbethAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['rosalindAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['rosalindAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['portiaAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['portiaAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['shylockAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['shylockAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['hamletAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['hamletAges'].sort(), .75))

        **/
        console.log(d3.quantile(characterAgesArrays['iagoAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['iagoAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['othelloAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['othelloAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['desdemonaAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['desdemonaAges'].sort(), .75))
        console.log(d3.quantile(characterAgesArrays['macbethAges'].sort(), .25))
        console.log(d3.quantile(characterAgesArrays['macbethAges'].sort(), .75))
        console.log(d3.quantile(characterAgesArrays['ladyMacbethAges'].sort(), .25))
        console.log(d3.quantile(characterAgesArrays['ladyMacbethAges'].sort(), .75))
        console.log(d3.quantile(characterAgesArrays['cleopatraAges'].sort(), .25))
        console.log(d3.quantile(characterAgesArrays['cleopatraAges'].sort(), .75))
        console.log(d3.quantile(characterAgesArrays['shylockAges'].sort(), .25))
        console.log(d3.quantile(characterAgesArrays['shylockAges'].sort(), .75))




	});
