let svg = d3.select('svg');

d3.queue()
    .defer(d3.tsv, 'data/ages/prospero_ages.tsv')
    .defer(d3.tsv, 'data/ages/romeo_ages.tsv')
    .defer(d3.tsv, 'data/ages/desdemona_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/macbeth_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/lady_mac_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/cleopatra_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages/shylock_ages.tsv')
    .defer(d3.tsv, 'data/ages/lear_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/rosalind_actor_ages.tsv')
    //.defer(d3.tsv, 'data/ages/rosalind_ages.tsv')
    .defer(d3.tsv, 'data/ages_updated/hamlet_actor_ages.tsv')
    .defer(d3.tsv, 'data/ages/juliet_ages.tsv')
	//.await(function(error, prospero, bassanio, desdemona, orlando, ladyMacbeth, cleopatra, shylock, lear, rosalind, hamlet, portia) {
    .await(function(error, ...characters) {

        //.clientWidth in Firefox has a bug
        let widthMax = document.querySelector('svg').getBoundingClientRect().width;

        //domain is age range (from age 10 to 85); range is svg coordinates (give some right and left padding)
        let scaleX = d3.scaleLinear().domain([10, 85]).range([20, widthMax - 80]);

        svg.append('g')
    		.attr('class', 'x axis')
    		.call(d3.axisBottom(scaleX));


        let indicies = {
            romeo: 0,
            hamlet: 1,
            macbeth: 2,
            shylock: 3,
            prospero: 4,
            lear: 5,
            desdemona: 0,
            rosalind: 1,
            juliet: 2,
            ladyMacbeth: 3,
            cleopatra: 4
        }

        let characterGenders = {
            hamlet: 'male',
            prospero: 'male',
            romeo: 'male',
            macbeth: 'male',
            lear: 'male',
            shylock: 'male',
            desdemona: 'female',
            rosalind: 'female',
            juliet: 'female',
            ladyMacbeth: 'female',
            cleopatra: 'female'
        }

        let characterAges = {
            /**
            hamletAges: {},
			portiaAges: {},
   	        shylockAges: {},

            **/
            prosperoAges: {gender: 'male', color: '#c0c400'},
            romeoAges: {gender: 'male', color: '#F7973A'},
            desdemonaAges: {gender: 'female', color: '#FC5863'},
            macbethAges: {gender: 'male', color: '#F8B535'},
   	        ladyMacbethAges: {gender: 'female', color: '#78779E'},
            cleopatraAges: {gender: 'female', color: '#577EAD'},
            shylockAges: {gender: 'male', color: '#F57A3E'},
            learAges: {gender: 'male', color: '#F45C42'},
            rosalindAges: {gender: 'female', color: '#CA6379'},
            hamletAges: {gender: 'male', color: '#FAE12F'},
			julietAges: {gender: 'female', color: '#A96B88'}

		};


		let characterAgesArrays = {
            /**
            hamletAges: [],
			portiaAges : [],
            **/
            prosperoAges: [],
            romeoAges: [],
            desdemonaAges: [],
            macbethAges: [],
			ladyMacbethAges : [],
            cleopatraAges: [],
            shylockAges : [],
            learAges: [],
            rosalindAges : [],
            hamletAges: [],
			julietAges: []
		}

        characters.forEach(character => {
            let characterName = character[0]['role'].toLowerCase().split(' ');
            if (characterName.length > 1) characterName[1] = characterName[1].charAt(0).toUpperCase() + characterName[1].substring(1);
            characterName = characterName.join('');
            console.log(characterName);
            processPoints(character, characterName, 1900, 1979);
        });
        /***
		processPoints(prospero, 'prospero', '1930', '1979');
        processPoints(bassanio, 'bassanio', '1930', '1979');
        processPoints(desdemona, 'desdemona', '1930', '1979');
        processPoints(orlando, 'orlando', '1930', '1979');
        processPoints(ladyMacbeth, 'ladyMacbeth', '1930', '1979');
        processPoints(cleopatra, 'cleopatra', '1930', '1979');
        processPoints(shylock, 'shylock', '1930', '1979');
        processPoints(lear, 'lear', '1930', '1979');
        processPoints(rosalind, 'rosalind', '1930', '1979');
        processPoints(hamlet, 'hamlet', '1930', '1979');
        processPoints(portia, 'portia', '1930', '1979');
        **/
        /**
        processPoints(prospero, 'prospero', 1960);
        processPoints(bassanio, 'bassanio', 1960);
        processPoints(desdemona, 'desdemona', 1960);
        processPoints(orlando, 'orlando', 1960);
        processPoints(ladyMacbeth, 'ladyMacbeth', 1960);
        processPoints(cleopatra, 'cleopatra', 1960);
        processPoints(shylock, 'shylock', 1960);
        processPoints(lear, 'lear', 1960);
        processPoints(rosalind, 'rosalind', 1960);
        processPoints(hamlet, 'hamlet', 1960);
        processPoints(portia, 'portia', 1960);
        **/
        let interquartiles = {};

        for (let char in characterAgesArrays) {
            let role = char.substring(0,char.length - 4);
            let ages = characterAgesArrays[char].sort((a,b) => a - b).filter(age => age > 10 && age < 90);
            console.log(ages);
            let twentyFifthPercentile = d3.quantile(ages, .25);
            let seventyFifthPercentile = d3.quantile(ages, .75);
            interquartiles[role] = [ages[0], twentyFifthPercentile, seventyFifthPercentile, ages[ages.length-1]];
            console.log(role + ': ' + d3.variance(ages));
        }

        console.log(interquartiles);

        /**
        console.log(d3.quantile(characterAgesArrays['iagoAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['iagoAges'].sort(), .75))
		console.log(d3.quantile(characterAgesArrays['bassanioAges'].sort(), .25))
		console.log(d3.quantile(characterAgesArrays['bassanioAges'].sort(), .75))
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

		function processPoints(characterData, character, startYear, endYear) {
            let end = typeof endYear == 'string' ? endYear : (endYear == null ? String(moment(new Date()).year()) : String(endYear));
            let start = typeof startYear == 'string' ? startYear : (startYear == null ? '1850' : String(startYear));
            let oppositeGender = characterGenders[character] == 'male' ? 'female' : 'male';
			characterData.forEach(function(role) {

				if (role['bday'] != 'person not found on wiki'
						&& role['bday'] != 'no birthday on article'
						&& role['bday'] != 'not a date' && role['actor_flag'] != 'flagged') {

                    let age = moment(role['opening_date']).diff(moment(role['bday']), 'years');

					if (age > 0 && moment(role['opening_date']) >= moment(start)
                                && moment(role['opening_date']) <= moment(end)
                                && role['gender'] != oppositeGender) {

                        if (character == 'juliet' && age < 20) {
                            console.log(role);
                            console.log(role['opening_date']);
                            console.log(role['actor'] + ' ' + age);
                        }

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
        let scaleYMale = d3.scaleLinear().domain([0,1]).range([20, 265]);
        let scaleYFemale = d3.scaleLinear().domain([0,1]).range([285, 560]);

        let female = scaleGender([20, 290], 6, 50);
        let male = scaleGender([310, 560], 5, 50);

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
                //If we want points to sit on the midline...
                } else {
                    return ((bandEnd - bandStart) * 0.5) + bandStart;
                }
            }
        }

        svg.selectAll('.roles').data(processAllPointsAlt2()).enter().append('circle')
            .attr('class', 'role-dots')
            .attr('cx', d => scaleX(d.age))
            .attr('cy', d => d.gender == 'male' ? male(d.index) : female(d.index))
            .attr('r', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? '3.6px' : '3px')
            .attr('fill', d => d.color) //== 'male' ? 'steelblue' : '#fc5863')
            .attr('stroke', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? 'rgba(40, 129, 129, 0.4)' : 'none')
            .attr('fill-opacity', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? .82 : .35)
            //.attr('filter', 'url(#blurMe)');

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

            let middleFiftyPercent = interquartiles[eachCharacter].slice(1,3);

            let charMeta = svg.append('g').classed('character-meta', true).attr('id', eachCharacter + 'meta');

            charMeta.append('path').datum(middleFiftyPercent)
                .attr('class', 'thick-line-quartile')
                .attr('d', interquartileLine)
                //.attr('stroke', '#42454c')
                .attr('stroke', '#7c8392')
                .attr('stroke-width', '6.5px')
                .attr('opacity', .85);

            charMeta.append('path').datum(interquartiles[eachCharacter])
                .attr('d', interquartileLine)
                .attr('class', 'thin-line-quartile')
                .attr('stroke', '#7c8392')
                .attr('stroke-width', '1.5px')
                .attr('opacity', .5)
                .attr('stroke-dasharray', '3,1');

            let text = charMeta.append('g').classed('interquartiles-labels', true)
                .attr('display', 'none')
                .selectAll('.text').data(interquartiles[eachCharacter]);

            text.enter().append('text')
                .attr('x', d => scaleX(d))
                .attr('y', d => yValue)
                .attr('text-anchor', 'middle')
                .attr('stroke', 'white')
                .attr('opacity', (d,i) => i == 1 || i == 2 ? 1 : .3)
                .text(d => d);
            /**
            text.selectAll('.text')
                .data(interquartiles[eachCharacter])
                .enter()
                .append('text')

            **/
            let radius = 21.5;
            let pad = 30;

            charMeta.append('circle').attr('r', radius).attr('cy', yValue).attr('cx', () => {
                //return (interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(84)) + pad;
                return scaleX(interquartiles[eachCharacter][3]) + pad;
            }).attr('stroke', '#7c8392')
            .attr('fill', () => characterAges[eachCharacter + 'Ages'].color)
            .attr('fill-opacity', .6)

            let arcStartX = scaleX(interquartiles[eachCharacter][3]) - (radius + 3) + pad;
            let arcEndX = scaleX(interquartiles[eachCharacter][3]) + (radius + 3) + pad;

            //let arcStartX = interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(80) + pad;
            //let arcEndX = interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(80) + pad + 1;

            charMeta.append('path')
                    .attr('id', eachCharacter + 'label')
                    .attr('d', `M ${arcStartX},${yValue} A ${radius + 3},${radius + 3}, 0 1,1 ${arcEndX},${yValue}`)
                    .attr('stroke-width', '3px')
                    .attr('fill', 'none');

            charMeta.append('text')
                    .datum(eachCharacter)
                    .attr('class', 'label-text')
                    .append('textPath')
                    .attr('xlink:href', d => '#' + d + 'label')
                    //.attr('alignment-baseline', 'hanging')
                    .attr('text-anchor', 'middle')
                    .attr('startOffset', '50%')
                    .attr('stroke', '#7c8392')
                    .text(d => d[0].toUpperCase() + d.substring(1,d.length));

            /**
            charMeta.on('mouseover', function() {
                console.log(middleFiftyPercent);
            });
            **/

            d3.select('#' + eachCharacter + 'meta')
                .on('mouseover', function () {
                    d3.select(this).select('.interquartiles-labels').attr('display', 'block');
                }).on('mouseout', function () {
                    d3.select(this).select('.interquartiles-labels').attr('display', 'none');
                });

        }

        //TODO...


        function transitions() {
            for (let eachChar in characterAges) {
                let {gender, color} = characterAges[eachChar];
                characterAges[eachChar] = {gender: gender, color: color};
            }
            for (let eachChar in characterAgesArrays) {
                characterAgesArrays[eachChar] = [];
            }

            console.log(characterAges);
            console.log(characterAgesArrays);


            characters.forEach(character => {
                let characterName = character[0]['role'].toLowerCase().split(' ');
                if (characterName.length > 1) characterName[1] = characterName[1].charAt(0).toUpperCase() + characterName[1].substring(1);
                characterName = characterName.join('');
                console.log(characterName);
                processPoints(character, characterName, 1980);
            });

            for (let char in characterAgesArrays) {
                let role = char.substring(0,char.length - 4);
                let ages = characterAgesArrays[char].sort((a,b) => a - b).filter(age => age > 18 && age < 100);
                console.log(ages);
                let twentyFifthPercentile = d3.quantile(ages, .25);
                let seventyFifthPercentile = d3.quantile(ages, .75);
                interquartiles[role] = [ages[0], twentyFifthPercentile, seventyFifthPercentile, ages[ages.length-1]];
                console.log(role + ': ' + d3.variance(ages));
            }

            console.log(interquartiles);
            //select group
            let meta = svg.selectAll('.character-meta');
            //select circles
            let data = processAllPointsAlt2();
            console.log(data);

            let points = svg.selectAll('.role-dots').data(data);

            let transitionA = d3.transition().duration(1000).ease(d3.easeQuadInOut);

            /**
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
            **/



            points.exit().remove();

            points.enter().append('circle').attr('class', 'role-dots')
                .attr('cx', d => scaleX(d.age))
                .attr('cy', d => d.gender == 'male' ? male(d.index) : female(d.index))
                .attr('r', '0px')
                .attr('fill', d => d.color) //== 'male' ? 'steelblue' : '#fc5863')
                .attr('stroke', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? 'rgba(40, 129, 129, 0.4)' : 'none')
                .attr('fill-opacity', 0)
                //.attr('filter', 'url(#blurMe)')
                .transition(transitionA)
                .attr('r', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? '3.6px' : '3px')
                .attr('fill-opacity', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? .82 : .35);


            points.transition(transitionA)
                //.attr('class', 'role-dots')
                .attr('cx', d => scaleX(d.age))
                .attr('cy', d => d.gender == 'male' ? male(d.index) : female(d.index))
                .attr('r', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? '3.6px' : '3px')
                .attr('fill', d => d.color) //== 'male' ? 'steelblue' : '#fc5863')
                .attr('stroke', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? 'rgba(40, 129, 129, 0.4)' : 'none')
                .attr('fill-opacity', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? .82 : .35)
                //.attr('filter', 'url(#blurMe)');


            for (let eachCharacter in interquartiles) {
                //).attr('id', eachCharacter + 'meta');
                let pad = 30;
                let radius = 21.5;

                let gender = characterGenders[eachCharacter];
                let index = indicies[eachCharacter];
                let yValue = gender == 'male' ? male(index, true) : female(index, true);

                let interquartileLine = d3.line().y(d => yValue).x(d => scaleX(d));

                let middleFiftyPercent = interquartiles[eachCharacter].slice(1,3);

                let characterMeta = d3.select('#' + eachCharacter + 'meta');
                characterMeta.select('.thick-line-quartile').datum(middleFiftyPercent).transition(transitionA)
                    .attr('d', interquartileLine);

                characterMeta.select('.thin-line-quartile').datum(interquartiles[eachCharacter]).transition(transitionA)
                    .attr('d', interquartileLine);

                characterMeta.select('circle').transition(transitionA).attr('cx', () => {
                    //return (interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(84)) + pad;
                    return scaleX(interquartiles[eachCharacter][3]) + pad;
                });
                let arcStartX = scaleX(interquartiles[eachCharacter][3]) - (radius + 3) + pad;
                let arcEndX = scaleX(interquartiles[eachCharacter][3]) + (radius + 3) + pad;

                //let arcStartX = interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(80) + pad;
                //let arcEndX = interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(80) + pad + 1;

                characterMeta.select('#' + eachCharacter + 'label').transition(transitionA)
                        .attr('d', `M ${arcStartX},${yValue} A ${radius + 3},${radius + 3}, 0 1,1 ${arcEndX},${yValue}`);

                let text = characterMeta.select('.interquartiles-labels').selectAll('text').data(interquartiles[eachCharacter]);

                text.enter();

                text.transition(transitionA)
                    .attr('x', d => scaleX(d))
                    .attr('y', d => yValue)
                    .text(d => d);


                /**
                charMeta.select('.label-text')
                        .datum(eachCharacter)
                        .attr('class', 'label-text')
                        .append('textPath')
                        .attr('xlink:href', d => '#' + d + 'label')
                        //.attr('alignment-baseline', 'hanging')
                        .attr('text-anchor', 'middle')
                        .attr('startOffset', '50%')
                        .attr('stroke', '#7c8392')
                        .text(d => d[0].toUpperCase() + d.substring(1,d.length));
                **/
            }
		              /**
            for (let eachCharacter in interquartiles) {
                let gender = characterGenders[eachCharacter];
                let index = indicies[eachCharacter];
                let yValue = gender == 'male' ? male(index, true) : female(index, true);
                let interquartileLine = d3.line().y(d => yValue).x(d => scaleX(d));
            ]let charMeta = svg.append('g').classed('character-meta', true).attr('id', eachCharacter + 'meta');
                let middleFiftyPercent = interquartiles[eachCharacter].slice(1,3);
                charMeta.append('path').datum(middleFiftyPercent)
                    .attr('d', interquartileLine)
                    //.attr('stroke', '#42454c')
                    .attr('stroke', '#7c8392')
                    .attr('stroke-width', '6.5px')
                    .attr('opacity', .85);
                charMeta.append('path').datum(interquartiles[eachCharacter])
                    .attr('d', interquartileLine)
                    .attr('stroke', '#7c8392')
                    .attr('stroke-width', '1.5px')
                    .attr('opacity', .5)
                    .attr('stroke-dasharray', '3,1');
                let radius = 21.5;
                let pad = 30;
                charMeta.append('circle').attr('r', radius).attr('cy', yValue).attr('cx', () => {
                    //return (interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(84)) + pad;
                    return scaleX(interquartiles[eachCharacter][3]) + pad;
                }).attr('stroke', '#7c8392')
                .attr('fill', () => characterAges[eachCharacter + 'Ages'].color)
                .attr('fill-opacity', .6)
                let arcStartX = scaleX(interquartiles[eachCharacter][3]) - (radius + 3) + pad;
                let arcEndX = scaleX(interquartiles[eachCharacter][3]) + (radius + 3) + pad;
                //let arcStartX = interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(80) + pad;
                //let arcEndX = interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(80) + pad + 1;
                charMeta.append('path')
                        .attr('id', eachCharacter + 'label')
                        .attr('d', `M ${arcStartX},${yValue} A ${radius + 3},${radius + 3}, 0 1,1 ${arcEndX},${yValue}`)
                        .attr('stroke-width', '3px')
                        .attr('fill', 'none');
                charMeta.append('text')
                        .datum(eachCharacter)
                        .attr('class', 'label-text')
                        .append('textPath')
                        .attr('xlink:href', d => '#' + d + 'label')
                        //.attr('alignment-baseline', 'hanging')
                        .attr('text-anchor', 'middle')
                        .attr('startOffset', '50%')
                        .attr('stroke', '#7c8392')
                        .text(d => d[0].toUpperCase() + d.substring(1,d.length));

                //charMeta.on('mouseover', function() {
                //    console.log(middleFiftyPercent);
                //});
                //d3.select('#' + eachCharacter + 'meta').on('mouseover', function() {
                //    console.log(middleFiftyPercent);
                //});

            }
						**/

        }

        d3.select('button').on('click', transitions);


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
        characterAgeHistogram(characterAges.bassanioAges, 'orange');
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
		////console.log(newArr(bassanioAgesArray))
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





	});


function randomBetween(maxMin) {
    let dif = maxMin[1] - maxMin[0];
    let randomVal = Math.random();
    return (randomVal * dif) + maxMin[0];
}
