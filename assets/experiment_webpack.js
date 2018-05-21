/**
    ES6 imports

**/
import moment from 'moment';
import { queue } from 'd3-queue';
import { tsv, json } from 'd3-request';
import { scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { variance, quantile } from 'd3-array';
import { select, selectAll } from 'd3-selection';
import { line } from 'd3-shape';
import { easeLinear, easeQuadInOut } from 'd3-ease';
import 'd3-transition';
import { transition } from 'd3-transition';
import { brushX, brushSelection } from 'd3-brush';
import * as annotation from 'd3-svg-annotation';
import { timer } from 'd3-timer';
import makeCurlyBrace from './curlyBraces';

console.log(makeCurlyBrace);

const throttle = require('lodash.throttle'); 


//Notes to self:
//Code snippet to select for the ticks in the axis to fix certain criteria since the axis isn't bound to data
//Array.from(document.querySelectorAll('.tick')).filter(group => parseInt(group.childNodes[1].innerHTML) >= 30)


const svg = select('.svg-main');
const brushControls = select('.svg-controls'); 
let windowHeight = window.innerHeight;
console.log(windowHeight);
//50 is height of brush control rect
select('.svg-main').attr('height', windowHeight - (windowHeight * .075));
select('.svg-controls').attr('height', windowHeight * .075);


queue()
  .defer(tsv, 'data/ages/shylock_ages.tsv')
  .defer(tsv, 'data/ages/ophelia_ages.tsv')
  .defer(tsv, 'data/ages/romeo_ages.tsv')
  .defer(tsv, 'data/ages_updated/portia_actor_ages.tsv')
  .defer(tsv, 'data/ages/desdemona_ages.tsv')
  .defer(tsv, 'data/ages_updated/macbeth_actor_ages.tsv')
  .defer(tsv, 'data/ages_updated/lady_mac_actor_ages.tsv')
  .defer(tsv, 'data/ages_updated/cleopatra_actor_ages.tsv')
  .defer(tsv, 'data/ages/iago_ages.tsv')
  .defer(tsv, 'data/ages/lear_ages.tsv')
  .defer(tsv, 'data/ages_updated/rosalind_actor_ages.tsv')
  .defer(tsv, 'data/ages_updated/richard_iii_actor_ages.tsv')
  .defer(tsv, 'data/ages_updated/hamlet_actor_ages.tsv')
  .defer(tsv, 'data/ages/juliet_ages.tsv')
  .defer(tsv, 'data/ages_updated/othello_actor_ages.tsv')
  .defer(tsv, 'data/ages/prospero_ages.tsv')
  .await(function(error, ...characters) {
    

    //5/15 test (est. count number of productions)
    let productions = []; 
      
    for (let eachRole in characters) {
      for (let eachActor in characters[eachRole]) {
        const production = characters[eachRole][eachActor]['director'] + ' ' + characters[eachRole][eachActor]['opening_date']; 
        if (!productions.includes(production)) productions.push(production);
      }
    }
		
    console.log(productions.length + ' productions');
    //Save special points for annotations
    let annotationCoordinates = {
      stewartOthello: {text: '', coordinates: []}, 
      canadaIago: {text: '', coordinates:[]},
    };
    //.clientWidth in Firefox has a bug
    let widthMax = document.querySelector('.svg-main').getBoundingClientRect().width;
    let heightMax = document.querySelector('.svg-main').getBoundingClientRect().height;
    let band = (heightMax - 75)/characters.length;

    //domain is age range (from age 10 to 85); range is svg coordinates (give some right and left padding)  
    const scaleX = scaleLinear().domain([10, 85]).range([60, widthMax - 80]);
	
    //Setup for brushing year filter
    const controlsHeight = document.querySelector('.svg-controls').getBoundingClientRect().height;
				
		const scaleYear = scaleLinear().domain([1900, 2018]).range([100, widthMax - 100]); 
				
		const brush = brushX().extent([[100,5], [widthMax - 100, controlsHeight - 20]])
      .on('brush', brushed)
      .on('end', brushEnded);
		
    function brushed() {
      const selection = brushSelection(this); 
      if (brushSelection(this)) {
        const years = brushSelection(this).map(scaleYear.invert).map(Math.round);
        if (selection[1] - selection[0] >= 100) {
          select('.start-year-label').attr('x', selection[0] + 5).attr('opacity', 1).text(years[0]);  
          select('.end-year-label').attr('x', selection[1] - 5).attr('opacity', 1).text(years[1]);  
        } else {
          select('.start-year-label').attr('opacity', 0);
          select('.end-year-label').attr('opacity', 0);
        }
        
      }
    }
	
    function brushEnded() {
      if (brushSelection(this)) {
        console.log(brushSelection(this).map(scaleYear.invert).map(Math.round));
        filterPoints(brushSelection(this).map(scaleYear.invert).map(Math.round))(); 
      }
    }

		const brushGroup = select('.svg-controls').append('g').classed('brush', true);
	
		brushGroup.call(brush);
	
		const startYear = select('.svg-controls').append('text').classed('start-year-label', true)
		  .attr('y', 10)
		  .attr('stroke', 'white')
		  .attr('alignment-baseline', 'hanging');
		const endYear = select('.svg-controls').append('text').classed('end-year-label', true)
      .attr('y', 10)
      .attr('stroke', 'white')
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'hanging');


    let indicies = {
      romeo: 0,
      hamlet: 1,
      macbeth: 2,
      iago: 3,
      othello: 4,
      richardIii: 5,
      shylock: 6,
      prospero: 7,
      lear: 8,
      juliet: 0,
      desdemona: 1,
      ophelia: 2,
      rosalind: 3,
      portia: 4,
      ladyMacbeth: 5,
      cleopatra: 6
    }

    let characterGenders = {
      hamlet: 'male',
      shylock: 'male',
      romeo: 'male',
      macbeth: 'male',
      lear: 'male',
      iago: 'male',
      othello: 'male',
      prospero: 'male',
      richardIii: 'male',
      desdemona: 'female',
      ophelia: 'female',
      rosalind: 'female',
      juliet: 'female',
      ladyMacbeth: 'female',
      cleopatra: 'female',
      portia: 'female'
    }
    let characterAges = {
      /**
      //Female: '#fc5863','#ec606c','#dc6776','#cb6d7f','#ba7187','#a77590','#90799b','#757ca4','#fc5863'
      //another Female: '#c44ec6','#be6ac6','#b782c6','#af97c6','#a4abc5','#96bdc5','#84d0c4','#6be3c3','#42f4c2'
      //option: '#4682b4','#407dab','#3978a4','#33739b','#2b6f92','#246a8a','#1c6582','#13607a'
      //Male: '#f7973a','#f89040','#f98946','#fa824c','#fa7b51','#fb7356','#fb6b5a','#fc625f','#fc5863'
      //female2: '#c44ec6','#af55bb','#9c5ab0','#855ea4','#6f609a','#58618f','#3d6184','#13607a'
      **/
      /**
      shylockAges: {gender: 'male', color: '#fb6b5a'},
      romeoAges: {gender: 'male', color: '#f7973a'},
      desdemonaAges: {gender: 'female', color: '#6f609a'},
      macbethAges: {gender: 'male', color: '#f89040'},
      ladyMacbethAges: {gender: 'female', color: '#3d6184'},
      cleopatraAges: {gender: 'female', color: '#855ea4'},
      iagoAges: {gender: 'male', color: '#fc625f'},
      learAges: {gender: 'male', color: '#fb7356'},
      othelloAges: {gender: 'male', color: '#f98946'},
      prosperoAges: {gender: 'male', color: '#fa824c'},
      rosalindAges: {gender: 'female', color: '#58618f'},
      portiaAges: {gender: 'female', color: '#9c5ab0'},
      hamletAges: {gender: 'male', color: '#fc5863'},
      julietAges: {gender: 'female', color: '#c44ec6'},
      opheliaAges: {gender: 'female', color: '#af55bb'}
      **/
      richardIiiAges: {gender: 'male', color: '#fb6b5a'},
      shylockAges: {gender: 'male', color: '#c0c400'},
      romeoAges: {gender: 'male', color: '#F7973A'},
      desdemonaAges: {gender: 'female', color: '#FC5863'},
      macbethAges: {gender: 'male', color: '#F36735'},
      ladyMacbethAges: {gender: 'female', color: '#78779E'},
      cleopatraAges: {gender: 'female', color: '#577EAD'},
      iagoAges: {gender: 'male', color: '#F45C42'},
      learAges: {gender: 'male', color: '#F57A3E'},
      othelloAges: {gender: 'male', color: '#F8B535'},
      prosperoAges: {gender: 'male', color: '#FC7136'},
      rosalindAges: {gender: 'female', color: '#CA6379'},
      portiaAges: {gender: 'female', color: '#AD5468'},
      hamletAges: {gender: 'male', color: '#FAE12F'},
      julietAges: {gender: 'female', color: '#A96B88'},
      opheliaAges: {gender: 'female', color: '#c44ec6'}   
    };
  
    let characterAgesArrays = {
      /**
      hamletAges: [],
			portiaAges : [],
      **/
      shylockAges: [],
      romeoAges: [],
      desdemonaAges: [],
      macbethAges: [],
      ladyMacbethAges : [],
      cleopatraAges: [],
      iagoAges : [],
      learAges: [],
      othelloAges: [],
      prosperoAges: [],
      rosalindAges : [],
      hamletAges: [],
      julietAges: [],
      portiaAges: [],
      opheliaAges: [],
      richardIiiAges: []
		}
    characters.forEach(character => {
      let characterName = character[0]['role'].toLowerCase().split(' ');
      if (characterName.length > 1) characterName[1] = characterName[1].charAt(0).toUpperCase() + characterName[1].substring(1);
      characterName = characterName.join('');
      processPoints(character, characterName, 1980);
      //processPoints(character, characterName, 1900, 2018);
    });
  
    let interquartiles = {};
    for (let char in characterAgesArrays) {
      let role = char.substring(0,char.length - 4);
      let ages = characterAgesArrays[char].sort((a,b) => a - b).filter(age => age > 10 && age < 90);
      let twentyFifthPercentile = quantile(ages, .25);
      let seventyFifthPercentile = quantile(ages, .75);
      interquartiles[role] = [ages[0], twentyFifthPercentile, seventyFifthPercentile, ages[ages.length-1]];
      console.log(role + ': ' + variance(ages));
      console.log(role + ': ' + quantile(ages, 0.5));
    }
    console.log(interquartiles);

    function processPoints(characterData, character, startYear, endYear) {
      let end = typeof endYear == 'string' ? endYear : (endYear == null ? String(moment(new Date()).year()) : String(endYear));
      let start = typeof startYear == 'string' ? startYear : (startYear == null ? '1850' : String(startYear));
      let oppositeGender = characterGenders[character] == 'male' ? 'female' : 'male';
      characterData.forEach(function(role) {
        if (role['bday'] != 'person not found on wiki'
            && role['bday'] != 'no birthday on article'
            && role['bday'] != 'not a date' && role['actor_flag'] != 'flagged') {
          
          let age = moment(role['opening_date']).diff(moment(role['bday']), 'years');
          
          //Old version
          //if (age > 0 && moment(role['opening_date']) >= moment(start)
          //	&& moment(role['opening_date']) <= moment(end)
          //	&& role['gender'] != oppositeGender) {
          
          if (age > 0 && moment(role['opening_date']) >= moment(start) 
              && moment(role['opening_date']) <= moment(end)) {
            
            if (character == 'cleopatra' && role['gender'] == 'male') {
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
  
    console.log(characterAges);
    
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
        const role = character.substring(0,character.length - 4);
        const roleAges = characterAges[character];
        const characterGender = roleAges.gender;
        const characterColor = roleAges.color;
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

    //Array of characters in groups; with ages when actors playing role in sorted form
    function processAllPointsAlt3() {
      const rolesArr = [];
      for (let character in characterAges) {
        const role = character.substring(0,character.length - 4);
        const roleAges = characterAges[character];
        const characterGender = roleAges.gender;
        const characterColor = roleAges.color;
        const roleAgesArray = [];
        //let genderIndex = actorsAges.findIndex(d => d.gender == characterGender);
        for (let age in roleAges) {
          if (age != 'gender' && age != 'color') {
            roleAges[age].forEach(a => {
              roleAgesArray.push({
                age: parseInt(age), 
                role: role, 
                race: a['race'], 
                opening: a['opening_date'],
                actorGender: a['gender'], 
                actor: a['actor']
              }); //pushing an integer; will be an object once refactored
              //actorsAges.push({role: role, gender: characterGender, age: parseInt(age), index: indicies[role], color: characterColor})
            });
          }
        }
        roleAgesArray.sort((a,b) => a.age - b.age);
        rolesArr.push({role: role, gender: characterGender, index: indicies[role], color: characterColor, ages: roleAgesArray});
      }
      return rolesArr;
    }
    console.log(processAllPointsAlt3());


    //Width = 1100
    //Height = 500
    //TODO: Get rid of hard-coded paddings and margins
    // padding-top == 30
    // padding-bottom == 60 (i.e., heightMax-60)
    // padding-between == 30 (i.e., -15 and + 15 in opposite directions)

    let female = scaleGender([15, band*7 + 15], 7);
    let male = scaleGender([band*7 + 15 + 50, heightMax - 10], 9);
    //let female = scaleGender([15, heightMax/2 - 25], 7);
    //let male = scaleGender([heightMax/2 + 25, heightMax - 10], 9);


    function scaleGender(range, numOfBands) {
      return function(index, randomFlag) {
        //calculate band start
        //gender band Height
        let fullBandStart = range[0];
        let fullHeight = range[1] - range[0];
        let bandHeight = fullHeight/numOfBands;
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

    
    //New Create role dots (with groups; see function processAllPointsAlt3)   
    svg.selectAll('.roles').data(processAllPointsAlt3()).enter()
      .append('g').attr('class', d => `role-dots-group ${d.role}-dots-group`)
      .each(function(roleData, i) {
        select(this).selectAll('.roles').data(roleData.ages).enter().append('circle')
          .attr('class', d => {
            return d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2]
              ? 'role-dots center-50-dot'
              : 'role-dots tail-dot';
          })
          .attr('cx', d => scaleX(d.age))
          .attr('cy', d => roleData.gender == 'male' ? male(roleData.index) : female(roleData.index))
          .attr('r', d => d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2] ? '3.6px' : '3px')
          .attr('fill', d => roleData.color) //== 'male' ? 'steelblue' : '#fc5863')
          //.attr('stroke', d => roleData.color)
          //.attr('stroke-opacity', 0)
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
          .each(function(actor) {
            if (actor.actor === 'Patrick Stewart' && actor.role === 'othello') {
              annotationCoordinates['stewartOthello'].coordinates.push(this.getAttribute('cx'), this.getAttribute('cy'));
            }
            if (actor.actor === 'Ron Canada' && actor.role === 'iago') {
              annotationCoordinates['canadaIago'].coordinates.push(this.getAttribute('cx'), this.getAttribute('cy'));
            } 
          });
      });
  
    console.log(annotationCoordinates);
						
	
    for (let eachCharacter in interquartiles) {
      const gender = characterGenders[eachCharacter];
      const index = indicies[eachCharacter];
      const yValue = gender == 'male' ? male(index, true) : female(index, true);
      const interquartileLine = line().y(d => yValue).x(d => scaleX(d));
      const middleFiftyPercent = interquartiles[eachCharacter].slice(1,3);
      const charMeta = svg.append('g').classed('character-meta', true).attr('id', eachCharacter + 'meta');
      const charMetaInner = charMeta.append('g').classed('character-meta-inner', true);
      const fullCharacterAgesRange = interquartiles[eachCharacter];
      const dataRange = [fullCharacterAgesRange[0], fullCharacterAgesRange[0]];
      const dataRangeMiddleFifty = [middleFiftyPercent[0], middleFiftyPercent[0]];

      function formatCharacterName(originalText) {
        const secondWordIndex = originalText.search(/[A-Z]/);
        let text;
        if (secondWordIndex > -1) {
          const storeSecondWordFirstLetter = originalText[secondWordIndex];
          text = originalText.substring(0,secondWordIndex) + ' ' + storeSecondWordFirstLetter + (originalText === 'richardIii' ? originalText.substring(secondWordIndex + 1).toUpperCase() : originalText.substring(secondWordIndex + 1));
        }
        console.log(text);
        return text ? text[0].toUpperCase() + text.substring(1)
                    : originalText[0].toUpperCase() + originalText.substring(1);
      }

      charMeta.append('text').datum(dataRange)
        .attr('x', d => scaleX(d[0]) - 5)
        .attr('y', d => yValue)
        .attr('opacity', 0)
        //.attr('stroke', '#d4cdda')
        .attr('stroke', () => characterAges[eachCharacter + 'Ages'].color)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'end')
        .attr('class', 'character-label-initial')
        .text(() => {
        //return eachCharacter.charAt(0).toUpperCase() + eachCharacter.substring(1);
          return formatCharacterName(eachCharacter);
        });

      charMetaInner.append('path').datum(dataRange)
        .attr('d', interquartileLine)
        .attr('class', 'thin-line-quartile')
        .attr('stroke', '#7c8392')
        .attr('stroke-width', '1.5px')
        .attr('opacity', .5)
        .attr('stroke-dasharray', '3,1');

      charMetaInner.append('text').datum(dataRange)
        .attr('x', d => scaleX(d[1]))
        // +2.5 because arrow doesn't quite align with the thin-line for some reasons...
        .attr('y', d => {
          const isFirefox = navigator.userAgent.match(/Firefox\/\d*/);
          return isFirefox ? yValue + 5 : yValue + 3;
        })
        .attr('opacity', 0)
        .classed('arrow', true)
        .style('font-size', '20px')
        .attr('alignment-baseline', 'middle')
        .attr('fill', '#7c8392')
        .text('\u2192')


      charMetaInner.append('path').datum(dataRangeMiddleFifty)
        .attr('class', 'thick-line-quartile')
        .attr('d', interquartileLine)
        .attr('stroke', '#d4cdda')
        //.attr('stroke', '#7c8392')
        .attr('stroke-width', '6.5px')
        .attr('opacity', .85);


                let text = charMetaInner.append('g').classed('interquartiles-labels', true)
                    .attr('display', 'none')
                    .selectAll('.text').data(interquartiles[eachCharacter]);

                text.enter().append('text')
                    .attr('x', d => scaleX(d))
                    .attr('y', d => yValue)
                    .attr('text-anchor', 'middle')
                    .attr('stroke', 'white')
                    .attr('opacity', (d,i) => i == 1 || i == 2 ? 1 : .3)
                    .text(d => d);

                let radius = 18.5;
                let pad = radius + 9;

                charMetaInner.append('circle').datum(eachCharacter)
                    .attr('id', eachCharacter + '-label-circle')
                    .attr('r', radius).attr('cy', yValue).attr('cx', () => {
                        //return (interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(84)) + pad;
                        return scaleX(interquartiles[eachCharacter][3]) + pad;
                    })//.attr('stroke', '#7c8392')
                    .attr('fill', () => characterAges[eachCharacter + 'Ages'].color)
                    .attr('fill-opacity', 0)
                    .attr('mask', 'url(#mask)')
                    //.attr('stroke-opacity', 0)
                    .attr('filter', 'url(#glowBlur)');

                let arcStartX = scaleX(interquartiles[eachCharacter][3]) - (radius + 3) + pad;
                let arcEndX = scaleX(interquartiles[eachCharacter][3]) + (radius + 3) + pad;


                charMetaInner.append('path')
                        .attr('id', eachCharacter + 'label')
                        .attr('d', `M ${arcStartX},${yValue} A ${radius + 3},${radius + 3}, 0 1,1 ${arcEndX},${yValue}`)
                        .attr('stroke-width', '3px')
                        .attr('fill', 'none');

                charMetaInner.append('text')
                        .datum(eachCharacter)
                        .attr('class', 'label-text ' + eachCharacter + '-label-text')
                        .attr('opacity', 0)
                        .append('textPath')
                        .attr('xlink:href', d => '#' + d + 'label')
                        .attr('text-anchor', 'middle')
                        .attr('startOffset', '50%')
                        .attr('stroke', 'white')
                        .attr('opacity', 0)
                        .attr('class', eachCharacter + '-label-text')
                        .text(d => formatCharacterName(d));

                select('#' + eachCharacter + 'meta')
                    .on('mouseover', function () {
                        select(this).select('.interquartiles-labels').attr('display', 'block');
                    }).on('mouseout', function () {
                        select(this).select('.interquartiles-labels').attr('display', 'none');
                    });

                }



        function animateDots(minAge = 0, maxAge = 90, slideFlag) {
            return function() {

                const delayFactor = 110;
                //calculate max Width for partial axis
                //ration of max width
                // (widthMax - 100)/75 == the width of each year in age
                let maxAxisWidth = (widthMax - 100)/75 * (maxAge - 10);
                // let scaleX = scaleLinear().domain([15, 85]).range([40, widthMax - 80]);
                let scaleXNew = scaleLinear().domain([10, maxAge]).range([60, scaleX(maxAge)]);

                let tickValues = [18, 20];

                while (tickValues[tickValues.length - 1] < maxAge) {
                    let nextLabelVal = maxAge - tickValues[tickValues.length - 1] < 10 ? maxAge : tickValues[tickValues.length - 1] + 10;
                    tickValues.push(nextLabelVal);
                }

                //Draw brackets
                //let female = scaleGender([30, heightMax/2 - 15], 7);
                //let male = scaleGender([heightMax/2 + 15, heightMax-60], 6);

                function createBracket(range, anchor, beamLength, thickness, className, label) {
                    if (!document.querySelector(`.${className}`)) {
                        let bracket = svg.append('g').attr('class', className);
                        bracket.append('rect').attr('x', 0).attr('y', range[0])
                            .attr('width', anchor)
                            .attr('height', range[1] - range[0])
                            .attr('fill', '#1a1b1e')
                            .attr('fill-opacity', .73);

                        bracket.append('line').attr('x1', anchor).attr('y1', range[0]).attr('x2', anchor).attr('y2', range[1])
                            .attr('stroke-width', `${thickness}px`).attr('stroke', 'white');

                        bracket.append('line').attr('x1', anchor)
                            .attr('y1', range[0] + thickness/2)
                            .attr('x2', anchor + beamLength)
                            .attr('y2', range[0] + thickness/2)
                            .attr('stroke-width', `${thickness}px`)
                            .attr('stroke', 'white');

                        bracket.append('line').attr('x1', anchor).attr('y1', range[1] - thickness/2)
                                .attr('x2', anchor + beamLength).attr('y2', range[1] - thickness/2)
                                .attr('stroke-width', `${thickness}px`).attr('stroke', 'white');

                        bracket.append('text')
                            .attr('class', 'bracket-text')
                            .attr('x', anchor)
                            .attr('y', ((range[1]-range[0])/2) + range[0])
                            .attr('stroke', 'white')
                            .attr('text-anchor', 'middle')
                            .attr('transform', `rotate(270, ${anchor}, ${(range[1]-range[0])/2 + range[0]}) translate(0,-10)`)
                            .text(label);

                    }
                }

								
							  //createBracket([15, heightMax/2 - 25], 40, 9, 4, 'female-bracket', 'FEMALE ROLES');
                //createBracket([heightMax/2 + 25, heightMax - 10], 40, 9, 4, 'male-bracket', 'MALE ROLES');
                createBracket([15, (band * 7) + 15], 40, 9, 4, 'female-bracket', 'FEMALE ROLES');
                createBracket([(band * 7) + 15 + 50, heightMax - 10], 40, 9, 4, 'male-bracket', 'MALE ROLES');  


                if (!document.querySelector('.axis')) {
                    svg.append('g')
                			.attr('class', 'x axis')
                    	.attr('opacity', 0)
											//.attr('transform', `translate(0,${heightMax/2 - 10})`)
                			.call(axisBottom(scaleXNew).tickValues([18, 20, 22]).tickSize(heightMax - 25))
                      .transition(2000)
                      .attr('opacity', 1)
									
										selectAll('.axis .tick text')
											//.attr('transform', `translate(0,-${heightMax/2 - 15})`);
                      .attr('transform', `translate(0,-${(band * 9) + 18})`);

										selectAll('.axis .tick line')
											.attr('stroke-dasharray', '2,2')
											.attr('stroke-opacity', .2)
											.attr('transform', `translate(0,15)`);

                    select('.domain').remove();

                    const ageAxis = document.querySelector('.axis');

                    const axisLabel = svg.append('text').attr('y', ageAxis.getBoundingClientRect().top - document.querySelector('.svg-main').getBoundingClientRect().top)
                        .attr('x', (ageAxis.getBoundingClientRect().left - document.querySelector('.svg-main').getBoundingClientRect().left)/2)
                        .attr('text-anchor', 'middle')
                        .attr('stroke', '#a6abb5')
                        .attr('font-size', '9px')
												.attr('transform', `translate(0,${band * 7 + 13})`)
												

                    axisLabel.append('tspan').attr('y', ageAxis.getBoundingClientRect().top - document.querySelector('.svg-main').getBoundingClientRect().top)
                        .attr('x', (ageAxis.getBoundingClientRect().left - document.querySelector('.svg-main').getBoundingClientRect().left)/2)
                        .text('AGE OF ACTOR')
                        .attr('dy', '8px');
                    axisLabel.append('tspan').attr('y', ageAxis.getBoundingClientRect().top - document.querySelector('.svg-main').getBoundingClientRect().top)
                        .attr('x', (ageAxis.getBoundingClientRect().left - document.querySelector('.svg-main').getBoundingClientRect().left)/2)
                        .text('DURING PRODUCTION')
                        .attr('dy', '23px').append('tspan').attr('class', 'note-indicator').text('*');


                        /*
                        .append('tspan')
                        .attr('class', 'note-indicator')
                        .text('*')
                        .attr('font-size', '12px');
                        //.attr('baseline-shift', 'super');
                        */

                } else {
                    svg.select('g.axis').transition(2000)
                        .call(axisBottom(scaleXNew)
															.tickValues(tickValues)
															.tickSize(heightMax - 25));

                    select('.domain').remove();
									
										selectAll('.axis .tick text')
											.attr('transform', `translate(0,-${(band * 9) + 18})`);
									
										selectAll('.axis .tick line')
											.attr('stroke-dasharray', '2,2')
											.attr('stroke-opacity', .2)
											.attr('transform', `translate(0,15)`);

                }

                const ageAxis = document.querySelector('.axis');
                console.log('left side of axis:' + ageAxis.getBoundingClientRect().left);



                /**
                if (!document.querySelector('.axis-label')) {
                    //let xCoord = document.querySelector('.axis').getBoundingClientRect().left
                    svg.append('text')
                        .text('AGE OF ACTOR WHEN FIRST PLAYING ROLE')
                        .classed('axis-label', true)
                        .attr('x', 40)
                        .attr('y', 10)
                        .attr('fill', 'white')
                        .attr('stroke', 'white')
                }
                **/

                if (slideFlag) {
                    const slideDistance = scaleX(minAge) - scaleX(18);
                    function translateLeft() {
                        selectAll('.role-dots-group').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                        selectAll('.character-meta-inner').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                        //selectAll('.character-label-initial').attr('stroke', 'rgb(255,255,255)');
                        selectAll('.axis').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                    }
                    translateLeft();
                }


                selectAll('.role-dots')
                    .filter(d => d.age >= minAge && d.age <= maxAge)
                    .transition(0)
                    //.delay(d => Math.pow((d.age - minAge), 1.2) * 80)
                    .delay(d => (d.age - minAge) * delayFactor)
                    .attr('fill-opacity', d => {
                        //if (d.age <= maxAge && d.age >= minAge) {
                        if (d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2]) {
                            console.log('good');
                            return .95;
                        } else {
                            return .4;
                        }
                        /**
                        } else {
                            console.log('invisible');
                            return 0;
                        }
                        **/
                    })
                    .attr('stroke-opacity', (d) => {
                        d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? 1 : 0;
                    });
                    //.attr('stroke', (d) => {
                    //    d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? 'rgba(40, 129, 129, 0.4)' : 'none';
                    //});

                for (let eachCharacter in interquartiles) {
                    const gender = characterGenders[eachCharacter];
                    const index = indicies[eachCharacter];
                    const yValue = gender == 'male' ? male(index, true) : female(index, true);

                    const interquartileLine = line().y(d => yValue).x(d => scaleX(d));
                    const middleFiftyPercent = interquartiles[eachCharacter].slice(1,3);

                    const fullCharacterAgesRange = interquartiles[eachCharacter];
                    let dataRange;
                    let dataRangeMiddleFifty;

                    //Buggy; need to think about minAge...
                    if (fullCharacterAgesRange[0] > maxAge) {
                        dataRange = [fullCharacterAgesRange[0], fullCharacterAgesRange[0]];
                    } else if (fullCharacterAgesRange[3] > maxAge) {
                        dataRange = [fullCharacterAgesRange[0], maxAge];
                    } else {
                        dataRange = [fullCharacterAgesRange[0], fullCharacterAgesRange[3]];
                    }

                    if (middleFiftyPercent[0] > maxAge) {
                        dataRangeMiddleFifty = [middleFiftyPercent[0], middleFiftyPercent[0]];
                    } else if (middleFiftyPercent[1] > maxAge) {
                        dataRangeMiddleFifty = [middleFiftyPercent[0], maxAge];
                    } else {
                        dataRangeMiddleFifty = [middleFiftyPercent[0], middleFiftyPercent[1]]
                    }


                    //let charMeta = svg.append('g').classed('character-meta', true).attr('id', eachCharacter + 'meta');
                    svg.select(`#${eachCharacter}meta`).select('.thin-line-quartile').datum(dataRange)
                        .transition()
                        //how does min Age play into here
                        .duration(d => d[0] >= minAge ? (d[1] - d[0]) * delayFactor : (d[1] - minAge) * delayFactor)
                        .delay(d => d[0] >= minAge ? (d[0] - minAge) * delayFactor : 0)
                        .ease(easeLinear)
                        .attr('d', interquartileLine);


                    svg.select(`#${eachCharacter}meta`).select('.thick-line-quartile').datum(dataRangeMiddleFifty)
                        .transition()
                        .duration(d => d[0] >= minAge ? (d[1] - d[0]) * delayFactor : (d[1] - minAge) * delayFactor)
                        .delay(d => d[0] >= minAge ? (d[0] - minAge) * delayFactor : 0)
                        .ease(easeLinear)
                        .attr('d', interquartileLine);


                    let initialLabel = svg.select(`#${eachCharacter}meta`).select('.character-label-initial').datum(dataRange);

                    initialLabel.transition()
                                .duration(d => d[0] >= minAge ? (d[1] - d[0]) * delayFactor : (d[1] - minAge) * delayFactor)
                                .delay(d => d[0] >= minAge ? (d[0] - minAge) * delayFactor : 0)
                                .attr('opacity', d => (d[0] == d[1] || maxAge >= fullCharacterAgesRange[3]) ? 0 : 1);


                    const arrow = svg.select(`#${eachCharacter}meta`).select('.arrow').datum(dataRange);
                    const charMeta = svg.select(`#${eachCharacter}meta`).select('.character-meta-inner').datum(dataRange);
                    const ageDots = svg.select(`.${eachCharacter}-dots-group`);

                    //if not in range yet, don't show arrow...

                    arrow.transition()
                        .duration(d => d[0] >= minAge ? (d[1] - d[0]) * delayFactor : (d[1] - minAge) * delayFactor)
                        .delay(d => d[0] >= minAge ? (d[0] - minAge) * delayFactor : 0)
                        .ease(easeLinear)
                        .attr('x', d => scaleX(d[1]))
                        .attr('opacity', d => d[0] == d[1] ? 0 : 1)
                        .on('end', function() {
                            select(this).attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0 : 1);
                            svg.select(`#${eachCharacter}meta`)
                                .select('.character-label-initial')
                                .attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0 : 1);

                            charMeta
                                .attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? .14 : 1);

                            ageDots
                                .selectAll('circle')
                                .filter(d => d.age <= maxAge)
                                .transition(500)
                                .attr('fill-opacity', d => {
                                    //console.log(this);
                                    if (maxAge >= fullCharacterAgesRange[3]) {
                                        return .1;
                                    } else {
                                        if (d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2]) {
                                            console.log('good');
                                            return .82;
                                        } else {
                                            return .35;
                                        }
                                    }
                                });


                            select(this)
                                .transition().duration(400)
                                .attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0 : 0.5)
                                .attr('x', d => scaleX(d[1]) + 4)
                                .transition().duration(400)
                                .attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0 : 1)
                                .attr('x', d => scaleX(d[1]) - 4)
                                .transition().duration(400)
                                .attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0 : 0.5)
                                .attr('x', d => scaleX(d[1]) + 4)
                                .transition().duration(400)
                                .attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0 : 1)
                                .attr('x', d => scaleX(d[1]) - 4)
                                .transition().duration(400)
                                .attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0 : 0.5)
                                .attr('x', d => scaleX(d[1]) + 4)
                                .transition().duration(400)
                                .attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0 : 1)
                                .attr('x', d => scaleX(d[1]))


                            /*

                                .attr('transform', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 'scale(1,1)' : 'scale(1.05,1)')

                                .attr('transform', 'scale(1,1)')
                                .ease(d3.easeBackOut);

                            */
                            selectAll(`.${eachCharacter}-label-text`).attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 1 : 0);
                            select(`#${eachCharacter}-label-circle`)
                                .attr('fill-opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0.6 : 0);
                                //.attr('stroke-opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 1 : 0);

                        });

                    }
            }
        }

        /*
        // Mini experiment to see if animations with masks work...
        select('svg').on('click', function() {
            const dots = selectAll('.role-dots').filter(d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2]);
            dots.attr('mask', 'url(#mask)');
            dots.transition().duration(500).attr('r', '5px');
        })
        */

        /**
        for (let eachCharacter in interquartiles) {
            let gender = characterGenders[eachCharacter];
            let index = indicies[eachCharacter];
            let yValue = gender == 'male' ? male(index, true) : female(index, true);

            let interquartileLine = line().y(d => yValue).x(d => scaleX(d));

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
                    .attr('stroke', 'white')
                    .text(d => d[0].toUpperCase() + d.substring(1,d.length));



            select('#' + eachCharacter + 'meta')
                .on('mouseover', function () {
                    select(this).select('.interquartiles-labels').attr('display', 'block');
                }).on('mouseout', function () {
                    select(this).select('.interquartiles-labels').attr('display', 'none');
                });

        }
        **/

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
                processPoints(character, characterName, 1900, 1979);
            });

            for (let char in characterAgesArrays) {
                let role = char.substring(0,char.length - 4);
                let ages = characterAgesArrays[char].sort((a,b) => a - b).filter(age => age > 18 && age < 100);
                console.log(ages);
                let twentyFifthPercentile = quantile(ages, .25);
                let seventyFifthPercentile = quantile(ages, .75);
                interquartiles[role] = [ages[0], twentyFifthPercentile, seventyFifthPercentile, ages[ages.length-1]];
                console.log(role + ': ' + variance(ages));
            }

            console.log(interquartiles);
            //select group
            let meta = svg.selectAll('.character-meta');
            //select circles
            let data = processAllPointsAlt2();
            console.log(data);

            /*
            svg.selectAll('.roles').data(processAllPointsAlt3()).enter()
                .append('g').attr('class', d => `role-dots-group ${d.role}-dots-group`)
                .each(function(roleData, i) {
                    select(this).selectAll('.roles').data(roleData.ages).enter().append('circle')
                        .attr('class', d => {
                            return d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2]
                                ? 'role-dots center-50-dot'
                                : 'role-dots tail-dot';
                        })
                        .attr('cx', d => scaleX(d.age))
                        .attr('cy', d => roleData.gender == 'male' ? male(roleData.index) : female(roleData.index))
                        .attr('r', d => d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2] ? '3.6px' : '3px')
                        .attr('fill', d => roleData.color) //== 'male' ? 'steelblue' : '#fc5863')
                        //.attr('stroke', 'white')
                        //.attr('stroke-opacity', 0)
                        .attr('fill-opacity', 0)
                });
            */


            //let points = svg.selectAll('.role-dots').data(data);
            let dotGroups = svg.selectAll('.role-dots-group').data(processAllPointsAlt3());

            dotGroups.enter();

            console.log(dotGroups)
            let transitionA = transition().duration(1500).ease(easeQuadInOut);

            dotGroups.each(function(roleData, i) {
                console.log(roleData.role + ': ' + i)
                let points = select(this).selectAll('.role-dots').data(roleData.ages);
                console.log(points);

                points.exit().remove();

                points.enter().append('circle').attr('class', 'role-dots')
                    .attr('class', d => {
                        return d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2]
                            ? 'role-dots center-50-dot'
                            : 'role-dots tail-dot';
                    })
                    .attr('cx', d => scaleX(d.age))
                    .attr('cy', d => roleData.gender == 'male' ? male(roleData.index) : female(roleData.index))
                    .attr('r', d => d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2] ? '3.6px' : '3px')
                    .attr('fill', d => roleData.color)
                    //.attr('stroke', d => roleData.color)
                    .attr('fill-opacity', 0)
							      .attr('stroke-opacity', 0)
                    //.attr('filter', 'url(#blurMe)')
                    .transition(transitionA)
                    .attr('r', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? '3.6px' : '3px')
                    .attr('fill-opacity', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? .82 : .35)



                points.transition(transitionA)
                    //.attr('class', 'role-dots')
                    .attr('cx', d => scaleX(d.age))
                    .attr('cy', d => roleData.gender == 'male' ? male(roleData.index) : female(roleData.index))
                    .attr('r', d => d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2] ? '3.6px' : '3px')
                    .attr('fill', d => roleData.color)
                    //.attr('stroke', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? 'rgba(40, 129, 129, 0.4)' : 'none')
                    .attr('fill-opacity', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? .82 : .35)
                    //.attr('stroke-opacity', 1)

            });



            for (let eachCharacter in interquartiles) {
                //).attr('id', eachCharacter + 'meta');
                let pad = 30;
                let radius = 21.5;

                let gender = characterGenders[eachCharacter];
                let index = indicies[eachCharacter];
                let yValue = gender == 'male' ? male(index, true) : female(index, true);

                let interquartileLine = line().y(d => yValue).x(d => scaleX(d));

                let middleFiftyPercent = interquartiles[eachCharacter].slice(1,3);

                let characterMeta = select('#' + eachCharacter + 'meta');
                characterMeta.select('.thick-line-quartile').datum(middleFiftyPercent).transition(transitionA)
                    .attr('d', interquartileLine);

                characterMeta.select('.thin-line-quartile').datum([interquartiles[eachCharacter][0], interquartiles[eachCharacter][3]])
                    .transition(transitionA)
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
                let interquartileLine = line().y(d => yValue).x(d => scaleX(d));
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
                //select('#' + eachCharacter + 'meta').on('mouseover', function() {
                //    console.log(middleFiftyPercent);
                //});

            }
						**/

        }
	
				//Highlights 
	
				function highlight1 () {
					selectAll('.role-dots')
						.filter(d => {
							return moment(d.opening) >= moment("1980") && moment(d.opening) < moment("2019");
						})
						.attr('fill-opacity', d => {
							if (d.role === 'othello' || d.role === 'iago') {
								if (d.actor === 'Ron Canada' || d.actor === 'Patrick Stewart') {
									return 1; 
								} else {
									return .8;
								}
							} else {
								return .02;
							}
								
						})
						.attr('stroke-opacity', d => {
							if ((d.role === 'othello' || d.role === 'iago') && (d.actor === 'Ron Canada' || d.actor === 'Patrick Stewart')) {
								return 1; 
							} else {
								return .05;
							}
						})
						.attr('stroke', d => {
							if ((d.role === 'othello' || d.role === 'iago') && (d.actor === 'Ron Canada' || d.actor === 'Patrick Stewart')) {
								return 'white';
							} else {
								return 'none';
							}
						})
						.attr('stroke-width', '2px')
					
					selectAll('.role-dots')
						.filter(d => (d.role === 'othello' || d.role === 'iago') && (d.actor === 'Ron Canada' || d.actor === 'Patrick Stewart'))
						.transition().duration(1000)
						.attr('r', '10px');

					
					const annotations = [
						//note color: #b4b8c0
						{
							note: {
								//label: 'Test text for this annotation. Somethings about Othello and Iago and race and ethnicity. This surprisingly does not look ugly thank you haha. I was worried. We can definitely work with this. Images might work better outside of SVG', 
								label: 'Patrick Stewart\'s staring turn in Jude Kelly\'s 1997 production of Othello with the Shakespeare Theatre Company was a rare exception to the modern \'no White Othello\' rule. Kelly shrewdly cast a White Othello amidst an all-Black cast, turning the traditional racial tensions in the play on its head.',
								wrap: 200,
								align: 'left'
							}, 
							connector: {
								end: 'arrow',
								type: 'curve', 
								points: [[33, -18]]
								//points: [[25, 25], [45, 22]]
							},
							x: +annotationCoordinates.stewartOthello.coordinates[0],
							y: +annotationCoordinates.stewartOthello.coordinates[1],
							dx: 65,
							dy: -20
						}
					];
					
					const makeAnnotations = annotation.annotation()
          	.type(annotation.annotationLabel)
          	.annotations(annotations);
					
					select('.svg-main')
						.append("g")
          	.attr("class", "annotation-group")
          	.call(makeAnnotations);
					
					select('.annotation-note-label').attr('fill', '#b4b8c0');
          select('.annotation-connector path')
            .attr('stroke', '#b4b8c0')
            .attr('stroke-width', '2px');
          select('.annotation-connector path.connector-end')
            .attr('fill', '#b4b8c0')
            .attr('stroke', 'grey')
            .attr('stroke-width', '3px');


          //select('div.main-content')
          //  .style('')
					
          
					//const note = select('.annotation-note');
					//note.attr('transform', 'translate(0,30)');
					
					const rect = select('.annotation-note-bg');
					rect.attr('fill-opacity', 1)
						.attr('fill', '#1a1b1e')
					//	.attr('height', () => +rect.node().getAttribute('height') + 18)
					//	.attr('width', () => +rect.node().getAttribute('width') + 20)


				}
	
				select('.highlight-1').on('click', highlight1);

  
  
  
        let state = 0;
        /*
        const eventsQueue = [
            animateDots(17, 23),
            animateDots(24, 30),
            animateDots(31, 45, false),
            animateDots(46, 85, false)
        ];
        */
        const eventsQueue = [
          [function() {
            const left = +document.querySelector('.svg-main').getBoundingClientRect().left;
            const right = +document.querySelector('.svg-main').getBoundingClientRect().right; 
            let mainContent = select('#main-content');
            mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);
            mainContent.html(`There are few Shakespearean lead roles available to the school-age actor in professional productions, with the obvious exceptions of <span>Romeo</span> and <span>Juliet</span>. Juliet is described as a girl of 13 in Shakespeare’s original text and Romeo is likely just a few years older; they’re undoubtedly the youngest of Shakespeare’s protagonists. There are a few early-20s <span>Hamlets</span> and Rosalinds, but you’d have to be a rare anomaly like Howard, or Joey to get cast in these roles while you’re still in school (or even freshly out of school).<svg class="embedded-svg" width=${right-left} height=250></svg>`);
            const height = +document.querySelector('#main-content').getBoundingClientRect().height; 
            let test = window.innerHeight/2 - height;
            console.log(test);
            mainContent.style('top', window.innerHeight/2 - height/2);
            const embedSVG = select('.embedded-svg');
            //generate random ages; 40 data points
            function generateAges() {
              let arrOfAges = []; 
              for (let i=0; i<40; i++) {
                arrOfAges.push(Math.ceil(Math.random() * 45) + 20);
              }
              return arrOfAges; 
            }
            let sortedSampleAges = generateAges().sort((a,b) => a - b); 
            let sampleInterquartiles = [sortedSampleAges[0], quantile(sortedSampleAges, 0.25), quantile(sortedSampleAges, 0.75), sortedSampleAges[sortedSampleAges.length - 1]]; 
            console.log(sampleInterquartiles);
            embedSVG.append('g')
              .classed('sampleRole', true)
              .selectAll('.roles')
              .data(sortedSampleAges)
              .enter()
              .append('circle')
              .attr('cx', d => scaleX(d))
              .attr('cy', d => {
                const min = 125 - band/2; 
                const max = 123 + band/2; 
                return Math.random() * (max - min) + min; 
              })
              .attr('r', d => d >= sampleInterquartiles[1] && d.age <= sampleInterquartiles[2] ? '3.6px' : '3px')
              .attr('fill', d => '#1c6582')
              .attr('fill-opacity', d => {
                //if (d.age <= maxAge && d.age >= minAge) {
                if (d >= sampleInterquartiles[1] && d <= sampleInterquartiles[2]) {
                    return .95;
                } else {
                    return .4;
                }
              });
            
            const sampleMeta = embedSVG.append('g').classed('legend-meta', true);
            const interquartileLine = line().y(125).x(d => scaleX(d));
            
            sampleMeta.append('text').datum([sampleInterquartiles[0], sampleInterquartiles[3]])
              .attr('x', d => scaleX(d[0]) - 5)
              .attr('y', 125)
              .attr('stroke', '#1c6582')
              .attr('alignment-baseline', 'middle')
              .attr('text-anchor', 'end')
              .attr('class', 'legend-character-label-initial')
              .text('Character Name');
        
            const braceFullCoords = makeCurlyBrace(scaleX(sampleInterquartiles[3]), 85, scaleX(sampleInterquartiles[0]), 85, 30, 0.54); 
            console.log(braceFullCoords)
            sampleMeta.append('path')
              .classed('curly-brace-full', true)
              .attr('d', braceFullCoords)
              .attr('stroke', '#d4cdda')
              .attr('stroke-width', '2px')
              .attr('fill', 'none');

            const braceInterquartileCoords = makeCurlyBrace(scaleX(sampleInterquartiles[1]), 150, scaleX(sampleInterquartiles[2]), 150, 30, 0.54); 
            console.log(braceFullCoords)
            sampleMeta.append('path')
              .classed('curly-brace-interquartile', true)
              .attr('d', braceInterquartileCoords)
              .attr('stroke', '#d4cdda')
              .attr('stroke-width', '2px')
              .attr('fill', 'none');
            
            sampleMeta.append('path').datum([sampleInterquartiles[0], sampleInterquartiles[3]])
              .attr('d', interquartileLine)
              .attr('class', 'thin-line-quartile')
              .attr('stroke', '#7c8392')
              .attr('stroke-width', '1.5px')
              .attr('opacity', .5)
              .attr('stroke-dasharray', '3,1');
            
            sampleMeta.append('path').datum([sampleInterquartiles[1], sampleInterquartiles[2]])
                .attr('class', 'thick-line-quartile')
                .attr('d', interquartileLine)
                .attr('stroke', '#d4cdda')
                .attr('stroke-width', '6.5px')
                .attr('opacity', .85);
            
            
          }, 'From ages 17 to 23..'],
          [function() {
            const left = (+document.querySelector('.svg-main').getBoundingClientRect().left) + (+scaleX(23)) + 112;
            const right = +document.querySelector('.svg-main').getBoundingClientRect().right; 
            animateDots(17, 23)(); 
            let mainContent = select('#main-content');
            //`position: fixed; top: 0; left: 400`
            mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);
            mainContent.html('There are few Shakespearean lead roles available to the school-age actor in professional productions, with the obvious exceptions of <span>Romeo</span> and <span>Juliet</span>. Juliet is described as a girl of 13 in Shakespeare’s original text and Romeo is likely just a few years older; they’re undoubtedly the youngest of Shakespeare’s protagonists. There are a few early-20s <span>Hamlets</span> and Rosalinds, but you’d have to be a rare anomaly like Howard, or Joey to get cast in these roles while you’re still in school (or even freshly out of school).');
            mainContent.style('opacity', 0);
            const height = +document.querySelector('#main-content').getBoundingClientRect().height; 
            let test = window.innerHeight/2 - height;
            console.log(test);
            mainContent.style('top', window.innerHeight/2 - height/2);
            mainContent.transition().delay(110 * (23-17)).style('opacity', 1);
            
          }, 'Up through 30...'],
          [function() {
            const left = (+document.querySelector('.svg-main').getBoundingClientRect().left) + (+scaleX(30)) + 112;
            const right = +document.querySelector('.svg-main').getBoundingClientRect().right; 
            animateDots(24, 30)(); 
            let mainContent = select('#main-content');
            mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);
            mainContent.html('As an actor, your Shakespearean career is now in full swing. We start to see all sorts of opportunities open up for both actors and actresses. You would be on the younger end for <span class="hamlet-color">Hamlet</span> or <span class="othello-color">Othello</span> or <span class="portia-color">Portia</span>, but your mid-to-late 20s is your best chance to snag the role of Romeo or Juliet. By the time you’re 30, you’d be close to aging out of our favorite tragic young lovers. At 30, you’d be older than 75+% of the actors who\'ve played these roles in our dataset.');
            const height = +document.querySelector('#main-content').getBoundingClientRect().height; 
            let test = window.innerHeight/2 - height;
            console.log(test);
            mainContent.style('top', window.innerHeight/2 - height/2);

          }, 'From 31 to 45'],
          [function() {
            const left = (+document.querySelector('.svg-main').getBoundingClientRect().left) + (+scaleX(45)) + 149;
            const right = +document.querySelector('.svg-main').getBoundingClientRect().right; 
            animateDots(31, 45)(); 
            let mainContent = select('#main-content');
            mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);
            mainContent.html('<p>Between 31 and 45 is where we start to see signs of divergence between the fates of actors and actresses. As a 45-year-old actress you’d be at least 3 years older than any recorded Juliet, Desdemona, Ophelia, Rosalind, or Portia in our sample.</p><p>While male actors would age out of Romeo and Hamlet by 45, actresses would already be at least 3 years older than any recorded Juliet, Desdemona, Ophelia, Rosalind, or Portia in our sample. Given that Rosalind and Portia are among the female Shakespearean characters with the most lines (both in the top 5), it’s a pretty small window of opportunity.</p><p>Even Lady Macbeth seems out of reach for most actresses at 45; we’re well out of our interquartile range ‘window of opportunity’, and if you’re cast as Lady Macbeth from this age onwards, you’d be older than 75+% of Lady Macbeths.</p><p>Male actors on the other hand, seem to be just getting into their strides. As a 45-year-old actor, you’re at or just a little over the median age of a Macbeth, Othello, or Richard III, and you’re just barely getting started with</p>');
            const height = +document.querySelector('#main-content').getBoundingClientRect().height; 
            let test = window.innerHeight/2 - height;
            console.log(test);
            mainContent.style('top', window.innerHeight/2 - height/2);
          }, 'From 46 to retirement...'],
          [function() {
            animateDots(46, 66)();
            let mainContent = select('#main-content');
            mainContent.html(null);
          }, 'After 66.'],
          [animateDots(67, 70), 'Seven Decades+'],
          [animateDots(71, 85), 'End'],
          [function() {
              selectAll('.character-meta-inner').transition().duration(1000).attr('opacity', 1);
              selectAll('.role-dots').transition().duration(1000).attr('fill-opacity', d => {
                  //if (d.age <= maxAge && d.age >= minAge) {
                  if (d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2]) {
                      console.log('good');
                      return .95;
                  } else {
                      return .4;
                  }
                  /**
                  } else {
                      console.log('invisible');
                      return 0;
                  }
                  **/
              });
          }]
        ];
        //console.log(animateDots(30))
        //let animate30 = animateDots(30);
        select('.transitions').on('click', transitions);
        select('.dots').on('click', function nextStep() {
            //console.log(this);
            select(this).node().innerHTML = eventsQueue.length - 1 == state ? select(this).node().innerHTML : eventsQueue[state][1];

            if (eventsQueue[state]) {
                eventsQueue[state][0]();
            }

            if (state < eventsQueue.length - 1) {
                state += 1;
                select(this).on('click', nextStep);
            } else {
                select(this).on('click', () => {});
                select(this).attr('disabled', true);
            }
            console.log(state);
        });
        document.addEventListener('keydown', function (e) {
          //e.preventDefault();
          console.log('keypressed: ' + e.code);
        });
        //select(document).on('keypress', function nextStep() {
        //    //console.log(this);
        //    select(this).node().innerHTML = eventsQueue.length - 1 == state ? select(this).node().innerHTML : eventsQueue[state][1];
//
        //    if (eventsQueue[state]) {
        //        eventsQueue[state][0]();
        //    }
//
        //    if (state < eventsQueue.length - 1) {
        //        state += 1;
        //        select(this).on('click', nextStep);
        //    } else {
        //        select(this).on('click', () => {});
        //        select(this).attr('disabled', true);
        //    }
        //    console.log(state);
        //});
  

        //let t = timer(function nextStep(elapsed) {
        //    console.log(elapsed);
        //    if (elapsed > state * 20000) {
        //      //select(this).node().innerHTML = eventsQueue.length - 1 == state ? select(this).node().innerHTML : eventsQueue[state][1];
        //      if (eventsQueue[state]) {
        //          eventsQueue[state][0]();
        //      }
        //      if (state < eventsQueue.length - 1) {
        //          state += 1;
        //          //select(this).on('click', nextStep);
        //      } else {
        //          //select(this).on('click', () => {});
        //          //select(this).attr('disabled', true);
        //          t.stop(); 
        //      }
        //      console.log(state);
        //    
        //    }
        //    
        //}, 20000);
  
				//Rough draft 
				function filterPoints(dateRange) {
					return function() {
						
						
						let filteredDots = selectAll('.role-dots').filter(d => {
							return moment(d.opening) >= moment(String(dateRange[0])) && moment(d.opening) < moment(String(dateRange[1] + 1));
						});
						
						console.log(filteredDots)
						
						selectAll('.role-dots')
							.attr('fill-opacity', d => {
								return moment(d.opening) >= moment(String(dateRange[0])) && moment(d.opening) < moment(String(dateRange[1] + 1))
									? (d.race != 'unknown' && d.race != 'none' ? 1 : .6)
									: .05; 
							})
							.attr('stroke', d => {
								if (moment(d.opening) >= moment(String(dateRange[0])) && moment(d.opening) < moment(String(dateRange[1] + 1))) return 'none';
							});
						
						const othelloPOCDots = filteredDots.filter(dot => dot.race != 'unknown' && dot.race != 'none' && dot.role == 'othello')._groups[0].length;
						const othelloDots = filteredDots.filter(dot => dot.role == 'othello')._groups[0].length;
						
						console.log(othelloPOCDots + ', ' + othelloDots);
						
						
						filteredDots.filter(dot => dot.race != 'unknown' && dot.race != 'none')
							.attr('r', '7px')
            	.attr('mask', 'url(#mask)');
						
						filteredDots.filter(dot => {
							let actor_gender = dot.actorGender; 
							if (characterGenders[dot.role] == 'male' && actor_gender == 'female') {
								return true; 
							} else if (characterGenders[dot.role] == 'female' && actor_gender == 'male') {
								return true; 
							} else {
								return false; 
							}
						})
						.attr('r', '7px')
						.attr('stroke', 'white')
						.attr('stroke-width', '2px')
						.attr('stroke-opacity', 1);
					}
					
				}
	
				select('.date-group1').on('click', filterPoints([1900, 1949]));
				select('.date-group2').on('click', filterPoints([1950, 1989]));
				select('.date-group3').on('click', filterPoints([1990, 2018]));
				//select('.date-group4').on('click', filterPoints([1960, 1979]));
				//select('.date-group5').on('click', filterPoints([1980, 1999]));
				//select('.date-group6').on('click', filterPoints([2000, 2018]));


        /**
        select('.dots2').on('click', animateDots(24, 30));
        select('.dots3').on('click', animateDots(31, 45, false));
        select('.dots4').on('click', animateDots(46, 85, false));
        **/
        //select('svg').on('click', animateDots(31, 85));

        //select('svg').on('click', function() {
            //select('svg').transition().duration(1000).attr("transform", "translate(" + -100 + "," + -100 + ")")
            //select('svg').transition().duration(2000).attr("transform", "scale(" + 1.3 + ")")
        //});

		//Find max freq of roles at each age
		console.log(characterAges);
		let allAgesFreqs = [];
		for (let character in characterAges) {
			//let ages = Object.keys(characterAges[character]);
			for (let age in characterAges[character]) {
                if (age != 'gender') {
                    let freq = characterAges[character][age].length;
    				allAgesFreqs.push(freq);
                }

			}
		}

		//let maxMinDates = d3.extent(arr, role => role['opening_date']).map(date => moment(date).valueOf());
		//let maxMinAgeFreqs = d3.extent(allAgesFreqs);
		//console.log(maxMinAgeFreqs)


        //let scaleY = scaleLinear().domain([0, maxMinAgeFreqs[1]]).range([330, 0]);

		//var area = d3.area()
		//	.curve(d3.curveCatmullRom)
    	//    .x(function(d) { return scaleX(parseInt(d[0])); })
    	//    .y1(function(d) { return scaleY(d[1]); })
		//	.y0(function(d) { return scaleY(0); });

        /**
		characterAgeHistogram(characterAges.iagoAges, 'steelblue');
        characterAgeHistogram(characterAges.bassanioAges, 'orange');
		//characterAgeHistogram(characterAges.ladyMacbethAges, '#c73683');
		//characterAgeHistogram(characterAges.rosalindAges, '#fc5863');
		characterAgeHistogram(characterAges.desdemonaAges, '#fc5863'); //#fa5fb2');
		//characterAgeHistogram(characterAges.iagoAges, '#5888b0');
        **/
        /**
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

        **/

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
