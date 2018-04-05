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
	//.defer(d3.tsv, 'data/ages/bassanio_ages.tsv')
    //.defer(d3.tsv, 'data/ages_updated/rosalind_actor_ages.tsv')
    //.defer(d3.tsv, 'data/ages_updated/orlando_actor_ages.tsv')
    //.defer(d3.tsv, 'data/ages/othello_ages.tsv')
    //.defer(d3.tsv, 'data/ages/bassanio_ages.tsv')
    //.defer(d3.tsv, 'data/ages_updated/macbeth_actor_ages.tsv')
    //.defer(d3.tsv, 'data/ages_updated/lady_mac_actor_ages.tsv')
    //.defer(d3.tsv, 'data/ages_updated/cleopatra_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/iago_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages/othello_ages.tsv')
    .defer(d3.tsv, 'data/ages/desdemona_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/macbeth_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/lady_mac_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/cleopatra_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages/shylock_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/antony_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/rosalind_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/hamlet_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/portia_actor_ages.tsv')
	.await(function(error, iago, othello, desdemona, macbeth, ladyMacbeth, cleopatra, shylock, antony, rosalind, hamlet, portia) {
		let scaleX = d3.scaleLinear().domain([10, 85]).range([20, 1000]);

        svg.append('g')
    		.attr('class', 'x axis')
    		.call(d3.axisBottom(scaleX));

        let indicies = {
            hamlet: 0,
            iago: 1,
            macbeth: 2,
            othello: 3,
            antony: 4,
            shylock: 5,
            desdemona: 0,
            rosalind: 1,
            portia: 2,
            ladyMacbeth: 3,
            cleopatra: 4
        }

        let characterGenders = {
            hamlet: 'male',
            iago: 'male',
            macbeth: 'male',
            othello: 'male',
            antony: 'male',
            shylock: 'male',
            desdemona: 'female',
            rosalind: 'female',
            portia: 'female',
            ladyMacbeth: 'female',
            cleopatra: 'female'
        }

        let characterAges = {
            /**
            hamletAges: {},
			portiaAges: {},
   	        shylockAges: {},

            **/
            iagoAges: {gender: 'male', color: '#c0c400'},
            othelloAges: {gender: 'male', color: '#F7973A'},
            desdemonaAges: {gender: 'female', color: '#FC5863'},
            macbethAges: {gender: 'male', color: '#F8B535'},
   	        ladyMacbethAges: {gender: 'female', color: '#78779E'},
            cleopatraAges: {gender: 'female', color: '#577EAD'},
            shylockAges: {gender: 'male', color: '#F57A3E'},
            antonyAges: {gender: 'male', color: '#F45C42'},
            rosalindAges: {gender: 'female', color: '#CA6379'},
            hamletAges: {gender: 'male', color: '#FAE12F'},
			portiaAges: {gender: 'female', color: '#A96B88'}

		};


		let characterAgesArrays = {
            /**
            hamletAges: [],
			portiaAges : [],
            **/
            iagoAges: [],
            othelloAges: [],
            desdemonaAges: [],
            macbethAges: [],
			ladyMacbethAges : [],
            cleopatraAges: [],
            shylockAges : [],
            antonyAges: [],
            rosalindAges : [],
            hamletAges: [],
			portiaAges: []
		}

		processPoints(iago, 'iago');
        processPoints(othello, 'othello');
        processPoints(desdemona, 'desdemona');
        processPoints(macbeth, 'macbeth');
        processPoints(ladyMacbeth, 'ladyMacbeth');
        processPoints(cleopatra, 'cleopatra');
        processPoints(shylock, 'shylock');
        processPoints(antony, 'antony');
        processPoints(rosalind, 'rosalind');
        processPoints(hamlet, 'hamlet');
        processPoints(portia, 'portia');


        let interquartiles = {};

        for (let char in characterAgesArrays) {
            let role = char.substring(0,char.length - 4);
            let ages = characterAgesArrays[char].sort((a,b) => a - b);
            console.log(ages);
            let twentyFifthPercentile = d3.quantile(ages, .25);
            let seventyFifthPercentile = d3.quantile(ages, .75);
            interquartiles[role] = [ages[0], twentyFifthPercentile, seventyFifthPercentile, ages[ages.length-1]]
        }

        console.log(interquartiles);

        /**
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
        **/

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

        console.log(characterAges)

        //Create historgram buckets with ALL Ages
        //input == characterAges

        /**
        function processAllPoints() {
            let actorsAges = {
                male: {},
                female: {}
            };

            for (let character in characterAges) {
                let role = character;
                let roleAges = characterAges[character];
                let characterGender = roleAges.gender;

                for (let age in roleAges) {
                    if (age != 'gender') {
                        roleAges[age].forEach(a => {
                            if (actorsAges[characterGender][age]) {
                                actorsAges[characterGender][age].push(role);
                            } else {
                                actorsAges[characterGender][age] = [role];
                            }
                        });
                    }


                }
            }

            return actorsAges;
        }
        **/

        function processAllPointsAlt() {
            let actorsAges = [
                {gender: 'male', roles: []},
                {gender: 'female', roles: []}
            ];

            for (let character in characterAges) {
                let role = character.substring(0,character.length - 4);
                let roleAges = characterAges[character];
                let characterGender = roleAges.gender;
                let genderIndex = actorsAges.findIndex(d => d.gender == characterGender);

                for (let age in roleAges) {
                    if (age != 'gender' && age != 'color') {
                        roleAges[age].forEach(a => {
                            actorsAges[genderIndex].roles.push({role: role, age: parseInt(age)})
                        });
                    }


                }
            }

            actorsAges.forEach(g => g.roles.sort((a,b) => a.age - b.age));

            return actorsAges;
        }

        function processAllPointsAlt2() {
            let actorsAges = [];

            for (let character in characterAges) {
                let role = character.substring(0,character.length - 4);
                let roleAges = characterAges[character];
                let characterGender = roleAges.gender;
                let characterColor = roleAges.color;
                //let genderIndex = actorsAges.findIndex(d => d.gender == characterGender);

                for (let age in roleAges) {
                    if (age != 'gender' && age != 'color') {
                        roleAges[age].forEach(a => {
                            actorsAges.push({role: role, gender: characterGender, age: parseInt(age), index: indicies[role], color: characterColor})
                        });
                    }
                }
            }

            actorsAges.sort((a,b) => a.age - b.age);

            return actorsAges;
        }

        //console.log(processAllPoints());
        console.log(processAllPointsAlt());
        console.log(processAllPointsAlt2())

        /**
        //Test....
        let testData = processAllPointsAlt();

        let genderGroups = svg.selectAll('.genders').data(testData).enter()
                            .append('g');


        genderGroups.selectAll('.points').data(d => d.roles).enter().append('circle');
        //End Test

        **/

        /**
		characterAgeHistogram(characterAges.iagoAges, 'steelblue');
		characterAgeHistogram(characterAges.desdemonaAges, '#fc5863');
        **/

        //Width = 1100
        //Height = 500

        //scaleX
        let scaleYMale = d3.scaleLinear().domain([0,1]).range([10, 265]);
        let scaleYFemale = d3.scaleLinear().domain([0,1]).range([285, 540]);

        let female = scaleGender([10, 265], 6, 50);
        let male = scaleGender([285, 540], 5, 50);

        function scaleGender(range, numOfBands, bandHeight) {
            return function(index, randomFlag) {
                //calculate band start
                //gender band Height
                let fullBandStart = range[0];
                let fullHeight = range[1] - range[0];
                let bandStart = index * ((fullHeight - bandHeight)/(numOfBands - 1)) + fullBandStart;
                let bandEnd = bandStart + bandHeight;
                if (!randomFlag) {
                    return ((bandEnd - bandStart) * Math.random()) + bandStart;
                } else {
                    return ((bandEnd - bandStart) * 0.5) + bandStart;
                }
            }
        }

        svg.selectAll('.roles').data(processAllPointsAlt2()).enter().append('circle')
            .attr('cx', d => scaleX(d.age))
            //.attr('cy', d => d.gender == 'male' ? scaleYMale(Math.random()) : scaleYFemale(Math.random()))
            .attr('cy', d => d.gender == 'male' ? male(d.index) : female(d.index))
            .attr('r', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? '4.6px' : '4px')
            .attr('fill', d => d.color) //== 'male' ? 'steelblue' : '#fc5863')
            .attr('stroke', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? 'rgba(40, 129, 129, 0.4)' : 'none')
            .attr('fill-opacity', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? .70 : .27);

        /**
        var area = d3.area()
            .curve(d3.curveCatmullRom)
            .x(function(d) { return scaleX(parseInt(d[0])); })
            .y1(function(d) { return scaleY(d[1]); })
            .y0(function(d) { return scaleY(0); });

        **/


        for (let eachCharacter in interquartiles) {
            let gender = characterGenders[eachCharacter];
            let index = indicies[eachCharacter];
            let yValue = gender == 'male' ? male(index, true) : female(index, true);

            let interquartileLine = d3.line().y(d => yValue).x(d => scaleX(d));

            let charMeta = svg.append('g').classed('character-meta', true);

            charMeta.append('path').datum(interquartiles[eachCharacter].slice(1,3))
                .attr('d', interquartileLine)
                .attr('stroke', '#42454c')
                .attr('stroke-width', '5px')
                .attr('opacity', .85);

            charMeta.append('path').datum(interquartiles[eachCharacter])
                .attr('d', interquartileLine)
                .attr('stroke', '#42454c')
                .attr('stroke-width', '1.5px')
                .attr('opacity', .5)
                .attr('stroke-dasharray', '3,1');

            let radius = 21;
            let pad = 23;

            charMeta.append('circle').attr('r', radius).attr('cy', yValue).attr('cx', () => {
                return (interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(80)) + pad;
            }).attr('stroke', 'black').attr('fill', 'none');

            let arcStartX = (interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(80)) - (radius + 3) + pad;
            let arcEndX = (interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(80)) + (radius + 3) + pad;

            //let arcStartX = interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(80) + pad;
            //let arcEndX = interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(80) + pad + 1;

            charMeta.append('path')
                    .attr('id', eachCharacter + 'label')
                    .attr('d', `M ${arcStartX},${yValue} A ${radius + 3},${radius + 3}, 0 1,1 ${arcEndX},${yValue}`)
                    .attr('stroke-width', '3px')
                    //.attr('stroke', 'black')
                    .attr('fill', 'none');

            charMeta.append('text')
                    .datum(eachCharacter)
                    .attr('class', 'label-text')
                    .append('textPath')
                    .attr('xlink:href', d => '#' + d + 'label')
                    //.attr('alignment-baseline', 'hanging')
                    .attr('text-anchor', 'start')
                    .text(d => d[0].toUpperCase() + d.substring(1,d.length));


        }



		//Find max freq of roles at each age
		console.log(characterAges);
		let allAgesFreqs = [];
		for (character in characterAges) {
			//let ages = Object.keys(characterAges[character]);
			for (age in characterAges[character]) {
                if (age != 'gender') {
                    let freq = characterAges[character][age].length;
    				allAgesFreqs.push(freq);
                }

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

        /**
		characterAgeHistogram(characterAges.iagoAges, 'steelblue');
        characterAgeHistogram(characterAges.othelloAges, 'orange');
		//characterAgeHistogram(characterAges.ladyMacbethAges, '#c73683');
		//characterAgeHistogram(characterAges.rosalindAges, '#fc5863');
		characterAgeHistogram(characterAges.desdemonaAges, '#fc5863'); //#fa5fb2');
		//characterAgeHistogram(characterAges.shylockAges, '#5888b0');
        **/

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





	});


function randomBetween(maxMin) {
    let dif = maxMin[1] - maxMin[0];
    let randomVal = Math.random();
    return (randomVal * dif) + maxMin[0];
}
