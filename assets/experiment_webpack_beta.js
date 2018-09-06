/**
    ES6 imports

**/

import moment from 'moment';
import { queue } from 'd3-queue';
import { csv, tsv, json } from 'd3-request';
import { scaleLinear } from 'd3-scale';
import { axisBottom } from 'd3-axis';
import { variance, quantile, median, max, min } from 'd3-array';
import { select, selectAll, event, mouse } from 'd3-selection';
import { line } from 'd3-shape';
import { easeLinear, easeQuadInOut } from 'd3-ease';
import 'd3-transition';
import { transition } from 'd3-transition';
import { brushX, brushSelection } from 'd3-brush';
import * as annotation from 'd3-svg-annotation';
import { interval } from 'd3-timer';
import { voronoi } from 'd3-voronoi';
import makeCurlyBrace from './curlyBraces';
//import animateShakespeare from './animate_shakespeare';

console.log(makeCurlyBrace);

const throttle = require('lodash.throttle');

//Notes to self:
//Code snippet to select for the ticks in the axis to fix certain criteria since the axis isn't bound to data
//Array.from(document.querySelectorAll('.tick')).filter(group => parseInt(group.childNodes[1].innerHTML) >= 30)


const isSafari = navigator.userAgent.match('Safari') && !navigator.userAgent.match('Chrome');
const svg = select('.svg-main');
svg.classed('mouse-disabled', true);
const brushControls = select('.svg-controls');
//let windowHeight = window.innerHeight;
let windowHeight = document.querySelector('body').clientHeight;
let windowWidth = document.querySelector('body').clientWidth;


console.log(windowWidth);
//50 is height of brush control rect
//10 is padding on bottom


svg
  .attr('height', windowHeight - (windowHeight * .075) - 8)
  .attr('width', '100%');
brushControls
  .attr('height', windowHeight * .075)
  .attr('width', '100%');


let animateStop = false;
let state = 0;
let locked = false;

queue()
  .defer(csv, 'data/shakespeare_outline.csv')
  .defer(tsv, 'data/master_1.tsv')
  .defer(tsv, 'data/master_2.tsv')
  .defer(tsv, 'data/ages/shylock_ages.tsv')
  .defer(tsv, 'data/ages/ophelia_ages.tsv')
  .defer(tsv, 'data/ages/romeo_ages.tsv')
  //.defer(tsv, 'data/ages_updated/portia_actor_ages.tsv')
  .defer(tsv, 'data/ages/portia_ages.tsv')
  .defer(tsv, 'data/ages/desdemona_ages.tsv')
  //.defer(tsv, 'data/ages_updated/macbeth_actor_ages.tsv')
  //.defer(tsv, 'data/ages_updated/lady_mac_actor_ages.tsv')
  .defer(tsv, 'data/ages/macbeth_ages.tsv')
  .defer(tsv, 'data/ages/lady_macbeth_ages.tsv')
  //.defer(tsv, 'data/ages_updated/cleopatra_actor_ages.tsv')
  .defer(tsv, 'data/ages/cleopatra_ages.tsv')
  .defer(tsv, 'data/ages/iago_ages.tsv')
  .defer(tsv, 'data/ages/lear_ages.tsv')
  //.defer(tsv, 'data/ages_updated/rosalind_actor_ages.tsv')
  //.defer(tsv, 'data/ages_updated/richard_iii_actor_ages.tsv')
  //.defer(tsv, 'data/ages_updated/hamlet_actor_ages.tsv')
  .defer(tsv, 'data/ages/rosalind_ages.tsv')
  .defer(tsv, 'data/ages/richard_ages.tsv')
  .defer(tsv, 'data/ages/hamlet_ages.tsv')
  .defer(tsv, 'data/ages/juliet_ages.tsv')
  //.defer(tsv, 'data/ages_updated/othello_actor_ages.tsv')
  .defer(tsv, 'data/ages/othello_ages.tsv')
  .defer(tsv, 'data/ages/prospero_ages.tsv')
  .await(function(error, shakespeareOutline, m1, m2, ...characters) {
    const actorsMasterList = m1.concat(m2);

    console.log(actorsMasterList);
    //5/15 test (est. count number of productions)

    //Save special points for annotations
    let annotationCoordinates = {
      stewartOthello: {text: '', coordinates: []},
      canadaIago: {text: '', coordinates:[]},
    };
    //.clientWidth in Firefox has a bug
    let widthMax = document.querySelector('.svg-main').getBoundingClientRect().width;
    let heightMax = document.querySelector('.svg-main').getBoundingClientRect().height;
    let band = (heightMax - 75)/characters.length;

    console.log('band: ' + band);

    //domain is age range (from age 10 to 85); range is svg coordinates (give some right and left padding)
    const scaleX = scaleLinear().domain([10, 86]).range([60, widthMax - 80]);



    //Setup for brushing year filter
    const controlsHeight = document.querySelector('.svg-controls').getBoundingClientRect().height;

	const scaleYear = scaleLinear().domain([1900, 2018]).range([100, widthMax - 100]);

	const brush = brushX().extent([[100, 20], [widthMax - 100, controlsHeight - 10]])
      .on('brush', brushed)
      .on('end', brushEnded);

    function brushed() {
      const selection = brushSelection(this);
      //console.log('selection: ' + selection);
      if (brushSelection(this)) {
        const years = brushSelection(this).map(scaleYear.invert).map(Math.round);

        if (document.querySelector('.chart-title-year-range')) {
            select('.chart-title-year-range').html(`${years[0]} and ${years[1]}`);
        }

      }
    }

    function brushEnded() {
      if (brushSelection(this)) {
        const years = brushSelection(this).map(scaleYear.invert).map(Math.round);

        console.log(brushSelection(this).map(scaleYear.invert).map(Math.round));
        filterPoints(brushSelection(this).map(scaleYear.invert).map(Math.round))();
        if (document.querySelector('.chart-title-year-range')) {
            select('.chart-title-year-range').html(`${years[0]} and ${years[1]}`);
        }
      } else {
        brushGroup.call(brush.move, [1900, 2018].map(scaleYear));
      }
    }

	const brushGroup = select('.svg-controls').append('g').classed('brush', true);

	brushGroup.call(brush);

    /**
	const startYear = select('.svg-controls').append('text').classed('start-year-label', true)
	   .attr('y', 25)
       .attr('stroke', 'white')
       .attr('alignment-baseline', 'hanging');
	const endYear = select('.svg-controls').append('text').classed('end-year-label', true)
      .attr('y', 25)
      .attr('stroke', 'white')
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'hanging');
     **/

    select('.overlay').style('pointer-events', 'none');

    const characterToPlayDict = {
        'juliet': 'Romeo and Juliet',
        'romeo': 'Romeo and Juliet',
        'ophelia': 'Hamlet',
        'hamlet': 'Hamlet',
        'desdemona': 'Othello',
        'othello': 'Othello',
        'iago': 'Othello',
        'richardIii': 'Richard III',
        'rosalind': 'As You Like It',
        'portia': 'The Merchant of Venice',
        'shylock': 'The Merchant of Venice',
        'ladyMacbeth': 'Macbeth',
        'macbeth': 'Macbeth',
        'cleopatra': 'Antony and Cleopatra',
        'prospero': 'The Tempest',
        'kingLear': 'King Lear',
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
      richardIiiAges: {gender: 'male', color: '#fb6b5a', idx: 5},
      shylockAges: {gender: 'male', color: '#c0c400', idx: 6},
      romeoAges: {gender: 'male', color: '#F7973A', idx: 0},
      desdemonaAges: {gender: 'female', color: '#FC5863', idx: 1},
      macbethAges: {gender: 'male', color: '#F36735', idx: 2},
      ladyMacbethAges: {gender: 'female', color: '#78779E', idx: 5},
      cleopatraAges: {gender: 'female', color: '#76818f', idx: 6},
      //cleopatraAges: {gender: 'female', color: '#577EAD', idx: 6},
      iagoAges: {gender: 'male', color: '#F45C42', idx: 4},
      kingLearAges: {gender: 'male', color: '#F57A3E', idx: 8},
      othelloAges: {gender: 'male', color: '#F8B535', idx: 3},
      prosperoAges: {gender: 'male', color: '#FC7136', idx: 7},
      rosalindAges: {gender: 'female', color: '#CA6379', idx: 3},
      portiaAges: {gender: 'female', color: '#AD5468', idx: 4},
      hamletAges: {gender: 'male', color: '#FAE12F', idx: 1},
      julietAges: {gender: 'female', color: '#A96B88', idx: 0},
      opheliaAges: {gender: 'female', color: '#c44ec6', idx: 2}
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
      kingLearAges: [],
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
      processPoints(character, characterName, true, 1980, 2019);
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
    //console.log(interquartiles);

    function processPoints(characterData, character, filterOppoGender, startYear, endYear) {
      let end = typeof endYear == 'string' ? endYear : (endYear == null ? String(moment(new Date()).year()) : String(endYear));
      let start = typeof startYear == 'string' ? startYear : (startYear == null ? '1850' : String(startYear));
      let oppositeGender = filterOppoGender ? (characterAges[character + 'Ages'].gender == 'male' ? 'female' : 'male') : null;
      characterData.forEach(function(role) {
        // new if statement: role['actor'] in actorsMasterList...

        if (role.actor == 'Byron Jennings') {
            console.log('Byron Jennings found');
            console.log(actorsMasterList.findIndex(actor => actor['actor_name'] == 'Byron Jennings'));
        }

        let actorIndex = actorsMasterList.findIndex(actor => role['actor'] === actor['actor_name']);

        //if (role['bday'] != 'person not found on wiki' && role['bday'] != 'no birthday on article' && role['bday'] != 'not a date' && role['actor_flag'] != 'flagged') {
        if (actorIndex != -1 && actorsMasterList[actorIndex]['formatted_bday'] != 'person not found on wiki'
            && actorsMasterList[actorIndex]['formatted_bday'] != 'no birthday on article'
            && actorsMasterList[actorIndex]['formatted_bday'] != 'not a date' && actorsMasterList[actorIndex]['is_actor'] != 'flagged') {

          //let age = moment(role['opening_date']).diff(moment(role['bday']), 'years', true);
          let age = moment(role['opening_date']).diff(moment(actorsMasterList[actorIndex]['formatted_bday']), 'years', true);

          role = Object.assign(role, actorsMasterList[actorIndex]);
          //console.log(age)
          //Old version
          if (age > 0 && moment(role['opening_date']) >= moment(start)
          	&& moment(role['opening_date']) <= moment(end)
          	//&& role['gender'] !== oppositeGender) {
            && actorsMasterList[actorIndex]['actor_gender'] !== oppositeGender) {

            //if (character == 'cleopatra' && role['gender'] == 'male') {
            //  console.log(role);
            //  console.log(role['opening_date']);
            //  console.log(role['actor'] + ' ' + age);
            //}

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
              actorsAges.push({role: role, gender: characterGender, age: parseInt(age), index: characterAges[role + 'Ages'].idx, color: characterColor})
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
        let index = 1;
        //let genderIndex = actorsAges.findIndex(d => d.gender == characterGender);
        for (let age in roleAges) {
          if (age != 'gender' && age != 'color' && age !== 'idx') {
            roleAges[age].forEach((a, i) => {
              /**
              roleAgesArray.push({
                age: parseFloat(age),
                role: role,
                race: a['race'],
                opening: a['opening_date'],
                actorGender: a['gender'],
                actor: a['actor'],
                yCoord: Math.random()
              }); //pushing an integer; will be an object once refactored
              **/
              roleAgesArray.push({
                tempID: index,
                age: parseFloat(age),
                role: role,
                race: a['ethnicity'],
                opening: a['opening_date'],
                bday: a['formatted_bday'],
                actorGender: a['actor_gender'],
                actor: a['actor'],
                isAgeEst: a['age_is_est'],
                yCoord: Math.random(),
                image: a['photo_url'],
                bdayDataSource: a['bday_data_source'],
                producers: a['company'],
                theatre: a['venue'],
                director: a['director']
              });

              index++;
              //actorsAges.push({role: role, gender: characterGender, age: parseInt(age), index: indicies[role], color: characterColor})
            });
          }
        }
        roleAgesArray.sort((a,b) => a.age - b.age);
        rolesArr.push({role: role, gender: characterGender, index: characterAges[role + 'Ages']['idx'], color: characterColor, ages: roleAgesArray});
      }
      console.log(rolesArr);

      const productions = [];

      rolesArr.forEach(roleArr => {
          roleArr.ages.forEach(perf => {
              const production = perf['director'] + ' ' + perf['opening'];
              if (!productions.includes(production)) productions.push(production);
          });
      });

      console.log(productions.length + ' productions');

      /**
      for (let eachRole in rolesArr) {
        for (let eachActor in characters[eachRole]) {
          const production = characters[eachRole][eachActor]['director'] + ' ' + characters[eachRole][eachActor]['opening_date'] + characters[eachRole][eachActor]['venue'];
          if (!productions.includes(production)) productions.push(production);
        }
      }

      console.log(productions.length + ' productions');
      **/
      return rolesArr;

    }


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
      return function(index, yCoord, randomFlag) {
        //calculate band start
        //gender band Height
        let fullBandStart = range[0];
        let fullHeight = range[1] - range[0];
        let bandHeight = fullHeight/numOfBands;
        let bandStart = index * ((fullHeight - bandHeight)/(numOfBands - 1)) + fullBandStart;
        let bandEnd = bandStart + bandHeight;
        if (!randomFlag) {
          //return ((bandEnd - bandStart) * Math.random()) + bandStart;
          return ((bandEnd - bandStart) * yCoord) + bandStart;
          //If we want points to sit on the midline...
        } else {
          return ((bandEnd - bandStart) * 0.5) + bandStart;
        }
      }
    }

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

    function voronoifyDataPoints(data) {
      const points = [];
      data.forEach(char => {
        char['ages'].forEach((actor, index) => {
          if (actor.age >= 17) {
              points.push({
                actor: actor,
                id: char.role + '-' + actor.tempID,
                age: actor.age,
                yCoord: actor.yCoord,
                charIndex: char['index'],
                charGender: char['gender']
              });
          }

        });
      });
      return points;
    }

    /**
    function voronoifyDataPoints(data) {
      const points = [];
      data.forEach(char => {
        const charArray = [];
        char['ages'].forEach((actor, index) => {
          if (actor.age >= 17) {
              charArray.push({
                id: char.role + '-' + index,
                age: actor.age,
                yCoord: actor.yCoord,
                charIndex: char['index'],
                charGender: char['gender']
              });
          }

        });
        points.push(charArray);
      });
      return points;
  }**/

    let pointsData = processAllPointsAlt3();


    //7/26 TODO: use pointsData to calculate all voronoi points

    //New Create role dots (with groups; see function processAllPointsAlt3)
    svg.selectAll('.roles').data(pointsData).enter()
      .append('g').attr('class', d => `role-dots-group ${d.role}-dots-group`)
      .each(function(roleData, i) {

        const roleOppoGender = roleData['gender'] == 'male' ? 'female' : 'male';
        const matchGender = roleData.ages.filter(d => d.actorGender !== roleOppoGender);
        const oppoGender = roleData.ages.filter(d => d.actorGender === roleOppoGender);

        select(this).selectAll('.roles').data(matchGender).enter().append('circle')
          .attr('class', d => {
            return d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2]
              ? 'role-dots center-50-dot'
              : 'role-dots tail-dot';
          })
          //.attr('id', (d, i) => `${d.role}-${i}`)
          .attr('id', d => `${d.role}-${d.tempID}`)
          .attr('cx', d => scaleX(d.age))
          .attr('cy', d => roleData.gender == 'male' ? male(roleData.index, d.yCoord) : female(roleData.index, d.yCoord))
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


        select(this).selectAll('.oppo-roles').data(oppoGender).enter().append('text')
          .attr('id', d => `${d.role}-${d.tempID}`)
          .attr('class', 'role-text-dots')
          .attr('x', d => scaleX(d.age))
          .attr('y', d => roleData.gender == 'male' ? male(roleData.index, d.yCoord) : female(roleData.index, d.yCoord))
          .attr('fill', d => roleData.color)
          .attr('stroke', d => roleData.color)
          .attr('stroke-opacity', 0)
          .attr('fill-opacity', 0)
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          //.style('font-size', '14px')
          .text(d => d.actorGender === 'male' ? '\u2642' : '\u2640');


      });

    console.log(annotationCoordinates);


    for (let eachCharacter in interquartiles) {
      const gender = characterAges[eachCharacter + 'Ages'].gender;
      const index = characterAges[eachCharacter + 'Ages'].idx;
      const yValue = gender == 'male' ? male(index, 0.5, true) : female(index, 0.5, true);
      const interquartileLine = line().y(d => yValue).x(d => scaleX(d));
      const middleFiftyPercent = interquartiles[eachCharacter].slice(1,3);
      const charMeta = svg.append('g').classed('character-meta', true).attr('id', eachCharacter + 'meta');
      const charMetaInner = charMeta.append('g').classed('character-meta-inner', true);
      const fullCharacterAgesRange = interquartiles[eachCharacter];
      const dataRange = [fullCharacterAgesRange[0], fullCharacterAgesRange[0]];
      const dataRangeMiddleFifty = [middleFiftyPercent[0], middleFiftyPercent[0]];

      charMeta.append('text').datum(dataRange)
        .attr('x', d => scaleX(d[0]) - 5)
        .attr('y', d => yValue)
        .attr('opacity', 0)
        //.attr('stroke', '#d4cdda')
        .attr('stroke', () => characterAges[eachCharacter + 'Ages'].color)
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', 'end')
        .style('letter-spacing', '1')
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
                /**
                select('#' + eachCharacter + 'meta')
                    .on('mouseover', function () {
                        select(this).select('.interquartiles-labels').attr('display', 'block');
                    }).on('mouseout', function () {
                        select(this).select('.interquartiles-labels').attr('display', 'none');
                    });
                **/

                }

        //annotations setup
        const makeAnnotations = annotation.annotation()
            .type(annotation.annotationLabel);

        const annotationGroup = select('.svg-main')
            .append('g')
            .attr("class", 'annotation-group');

        function animateDots(minAge = 0, maxAge = 90, directionForward, completeRange, slideFlag) {
            return function(direction) {

                const delayFactor = 110;
                //calculate max Width for partial axis
                //ration of max width
                // (widthMax - 100)/75 == the width of each year in age
                const maxAxisWidth = (widthMax - 100)/75 * (maxAge - 10);
                // let scaleX = scaleLinear().domain([15, 85]).range([40, widthMax - 80]);
                const scaleXNew = scaleLinear().domain([10, maxAge]).range([60, scaleX(maxAge)]);

                const tickValues = [18, 20];

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
                        /**
                        bracket.append('rect').attr('x', 0).attr('y', range[0])
                            .attr('width', anchor)
                            .attr('height', range[1] - range[0])
                            .attr('fill', '#1a1b1e')
                            .attr('fill-opacity', .73);
                        **/

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
                            .style('letter-spacing', '1')
                            .attr('class', 'bracket-text')
                            .attr('x', anchor)
                            .attr('y', ((range[1]-range[0])/2) + range[0])
                            .attr('stroke', 'white')
                            .attr('text-anchor', 'middle')
                            .attr('transform', `rotate(270, ${anchor}, ${(range[1]-range[0])/2 + range[0]}) translate(0,-10)`)
                            .text(label);

                    }
                }


                if (!document.querySelector('.axis')) {
                    svg.append('g')
                			.attr('class', 'x axis')
                    	.attr('opacity', 0)
											//.attr('transform', `translate(0,${heightMax/2 - 10})`)
                			.call(axisBottom(scaleXNew).tickValues([18, 20, 22]).tickSize(heightMax - 25))
                      .transition(2000)
                      .attr('opacity', 1)

										selectAll('.axis .tick text')
                      .attr('transform', `translate(0,-${(band * 9) + 18})`);

										selectAll('.axis .tick line')
											.attr('stroke-dasharray', '2,2')
											.attr('stroke-opacity', .2)
											.attr('transform', `translate(0,15)`);

                    select('.domain').remove();

                    const ageAxis = document.querySelector('.axis');

                    //invisible rect
                    svg.append('rect').attr('x', 0).attr('y', 15)
                        .attr('width', 40)
                        .attr('height', heightMax - 25)
                        .attr('fill', '#1a1b1e')
                        .attr('fill-opacity', .92);

                    const axisLabel = svg.append('text').attr('y', ageAxis.getBoundingClientRect().top - document.querySelector('.svg-main').getBoundingClientRect().top)
                        .attr('x', (ageAxis.getBoundingClientRect().left - document.querySelector('.svg-main').getBoundingClientRect().left)/2)
                        .attr('text-anchor', 'middle')
                        .attr('stroke', '#a6abb5')
                        .attr('font-size', '9px')
						.attr('transform', `translate(0,${band * 7 + 13})`)


                    axisLabel.append('tspan').attr('y', ageAxis.getBoundingClientRect().top - document.querySelector('.svg-main').getBoundingClientRect().top)
                        .attr('x', (ageAxis.getBoundingClientRect().left - document.querySelector('.svg-main').getBoundingClientRect().left)/2)
                        .text('AGE OF ACTOR')
                        .style('letter-spacing', '1')
                        .attr('dy', '8px');
                    axisLabel.append('tspan').attr('y', ageAxis.getBoundingClientRect().top - document.querySelector('.svg-main').getBoundingClientRect().top)
                        .attr('x', (ageAxis.getBoundingClientRect().left - document.querySelector('.svg-main').getBoundingClientRect().left)/2)
                        .text('DURING PRODUCTION')
                        .style('letter-spacing', '1')
                        .attr('dy', '23px');//.append('tspan').attr('class', 'note-indicator').text('*');


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

                //createBracket([15, heightMax/2 - 25], 40, 9, 4, 'female-bracket', 'FEMALE ROLES');
                  //createBracket([heightMax/2 + 25, heightMax - 10], 40, 9, 4, 'male-bracket', 'MALE ROLES');
                createBracket([15, (band * 7) + 15], 40, 9, 4, 'female-bracket', 'FEMALE ROLES');
                createBracket([(band * 7) + 15 + 50, heightMax - 10], 40, 9, 4, 'male-bracket', 'MALE ROLES');


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

                selectAll('.role-text-dots')
                  .filter(d => d.age >= minAge && d.age <= maxAge)
                  .transition(0)
                  //.delay(d => Math.pow((d.age - minAge), 1.2) * 80)
                  .delay(d => (d.age - minAge) * delayFactor)
                  .attr('stroke-opacity', (d) => {
                    d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? 1 : 0;
                  })
                  .attr('fill-opacity', d => {
                    return 1;
                      ////if (d.age <= maxAge && d.age >= minAge) {
                      //if (d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2]) {
                      //    console.log('good');
                      //    return .95;
                      //} else {
                      //    return .4;
                      //}
                  })

                selectAll('.role-dots').attr('mask', 'none');

                if (directionForward) {
                  selectAll('.role-dots')
                    .filter(d => d.age >= minAge && d.age <= maxAge)
                    .transition(0)
                    //.delay(d => Math.pow((d.age - minAge), 1.2) * 80)
                    .delay(d => (d.age - minAge) * delayFactor)
                    .attr('fill-opacity', d => {
                        //if (d.age <= maxAge && d.age >= minAge) {
                        if (d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2]) {
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
                    //.attr('stroke-opacity', (d) => {
                    //    d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? 1 : 0;
                    //});
                } else {
                  selectAll('.role-dots').interrupt().transition(0)
                    .attr('fill-opacity', d => {
                        if (maxAge >= interquartiles[d.role][3]) {
                          return .1;
                        } else if (d.age <= maxAge) { //} && d.age >= minAge) {
                          if (d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2]) {
                              //console.log('good');
                              return .95;
                          } else {
                              return .4;
                          }
                        } else {
                          return 0;
                        }
                        /**
                        } else {
                            console.log('invisible');
                            return 0;
                        }
                        **/
                  });

                  //.filter(d => d.age >= minAge && d.age <= maxAge)
                }



                for (let eachCharacter in interquartiles) {
                    const gender = characterAges[eachCharacter + 'Ages'].gender;
                    const index = characterAges[eachCharacter + 'Ages'].idx;
                    const yValue = gender == 'male' ? male(index, 0.5, true) : female(index, 0.5, true);

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


                    if (directionForward) {
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
                    } else {
                      svg.select(`#${eachCharacter}meta`).select('.thin-line-quartile').interrupt().datum(dataRange).attr('d', interquartileLine);
                      svg.select(`#${eachCharacter}meta`).select('.thick-line-quartile').interrupt().datum(dataRangeMiddleFifty).attr('d', interquartileLine);

                    }

                    //let charMeta = svg.append('g').classed('character-meta', true).attr('id', eachCharacter + 'meta');



                    const initialLabel = svg.select(`#${eachCharacter}meta`).select('.character-label-initial').datum(dataRange);

                    if (directionForward) {
                      initialLabel
                        .transition()
                        .duration(d => d[0] >= minAge ? (d[1] - d[0]) * delayFactor : (d[1] - minAge) * delayFactor)
                        .delay(d => d[0] >= minAge ? (d[0] - minAge) * delayFactor : 0)
                        .attr('opacity', d => (d[0] == d[1] || maxAge >= fullCharacterAgesRange[3]) ? 0 : 1);
                    } else {
                      initialLabel
                        .interrupt()
                        .transition(0)
                        .attr('opacity', d => (d[0] == d[1] || maxAge >= fullCharacterAgesRange[3]) ? 0 : 1);
                    }



                    const arrow = svg.select(`#${eachCharacter}meta`).select('.arrow').datum(dataRange);
                    const charMeta = svg.select(`#${eachCharacter}meta`).select('.character-meta-inner').datum(dataRange);
                    const ageDots = svg.select(`.${eachCharacter}-dots-group`);

                    //if not in range yet, don't show arrow...

                    if (directionForward) {
                      arrow.transition()
                        .duration(d => d[0] >= minAge ? (d[1] - d[0]) * delayFactor : (d[1] - minAge) * delayFactor)
                        .delay(d => d[0] >= minAge ? (d[0] - minAge) * delayFactor : 0)
                        .ease(easeLinear)
                        .attr('x', d => scaleX(d[1]))
                        .attr('opacity', d => d[0] == d[1] ? 0 : 1)

                        .on('start', () => {
                            if (eachCharacter == 'kingLear') {
                                locked = true
                                console.log(locked)
                            }

                        })
                        .on('end', function() {
                            if (eachCharacter == 'kingLear' && !completeRange) {
                                locked = false
                                console.log(locked)
                            }
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
                                            return .82;
                                        } else {
                                            return .35;
                                        }
                                    }
                                });

                            ageDots.selectAll('text')
                                .filter(d => d.age <= maxAge)
                                .transition(500)
                                .attr('stroke-opacity', d => {
                                    //console.log(this);
                                    if (maxAge >= fullCharacterAgesRange[3]) {
                                        return .1;
                                    } else {
                                        return 1;
                                    }
                                })
                                .attr('fill-opacity', d => {
                                    //console.log(this);
                                    if (maxAge >= fullCharacterAgesRange[3]) {
                                        return .1;
                                    } else {
                                        return 1;
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
                                .attr('x', d => scaleX(d[1]));


                            /*

                                .attr('transform', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 'scale(1,1)' : 'scale(1.05,1)')

                                .attr('transform', 'scale(1,1)')
                                .ease(d3.easeBackOut);

                            */
                            selectAll(`.${eachCharacter}-label-text`).attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 1 : 0);
                            select(`#${eachCharacter}-label-circle`)
                                .attr('fill-opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0.6 : 0);
                                //.attr('stroke-opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 1 : 0);


                            console.log(eachCharacter);

                                    if (completeRange && eachCharacter == 'kingLear') {
                                        selectAll('.character-meta-inner').transition().duration(1000).attr('opacity', 1);
                                        selectAll('.role-dots').transition().duration(1000).attr('fill-opacity', d => {
                                            //if (d.age <= maxAge && d.age >= minAge) {
                                            if (d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2]) {
                                                //console.log('good');
                                                return .95;
                                            } else {
                                                return .4;
                                            }

                                        });
                                        //const slideDistance = scaleX(minAge) - scaleX(18);
                                        function translateDown() {
                                            const transitionDown = transition().duration(1500).on('end', function() {
                                                locked = false;
                                                const mainContent = select('#main-content');

                                                //mainContent.style('opacity', 0);
                                                mainContent.style('width', 1230);
                                                mainContent.style('left', (window.innerWidth - 1230)/2 + 20);
                                                //mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);

                                                mainContent.html(`<h2>Female role age distributions in <span>productions since 1980</span></h2><p>In recent decades, as an actress, you've have had a rather narrow window (around two decades or so starting in your late teens) to play some of the most substantive Shakespearean female roles.
                                                <span class='ladyMacbeth-color'>Lady Macbeth</span> and <span class='cleopatra-color'>Cleopatra</span> aside, if you’re an actress who wants a staring turn in Shakespeare,
                                                you pretty much have to do so before you turn 40. You might think that there is nothing surprising about this, given that these characters are all young, and naturally, the actresses cast should also be on the younger end.
                                                But interestingly enough, this wasn’t always the case.</p>`);
                                                const height = +document.querySelector('#main-content').getBoundingClientRect().height;
                                                const topOfSVGContainer = +document.querySelector('.svg-main').getBoundingClientRect().top;

                                                mainContent.style('top', (topOfSVGContainer - height)/2);

                                                //mainContent.style('top', window.innerHeight/2 - height/2);
                                                mainContent.transition().duration(0).delay(300).style('opacity', 1);

                                            });
                                            if (isSafari) {
                                                select('.svg-main').transition(transitionDown).style('transform', `translate(0px,${band * 9 + 20}px)`);
                                            } else {
                                                select('.svg-main').transition(transitionDown).attr('transform', `translate(0,${band * 9 + 20})`);
                                            }
                                            //selectAll('.role-dots-group').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                                            //selectAll('.character-meta-inner').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                                            //selectAll('.character-label-initial').attr('stroke', 'rgb(255,255,255)');
                                            //selectAll('.axis').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                                        }
                                        translateDown();

                                        /**
                                        const left = (+document.querySelector('.svg-main').getBoundingClientRect().left) + (+scaleX(66)) + 82;
                                        const right = +document.querySelector('.svg-main').getBoundingClientRect().right - 10;

                                        animateDots(45, 66, directionForward)();
                                        const mainContent = select('#main-content');

                                        mainContent.style('opacity', 0);
                                        mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);

                                        mainContent.html('<h2>From age 46 to 66 <span>productions since 1980</span></h2><p>By the time you hit retirement age as an actress, you’re basically out of female roles to play. Contrast this with the major male roles like <span class="kingLear-color">King Lear</span> or <span class="shylock-color">Shylock</span>, where at 66, you’re still younger than at least 25% or more of the actors who have played the parts.</p>');
                                        const height = +document.querySelector('#main-content').getBoundingClientRect().height;

                                        mainContent.style('top', window.innerHeight/2 - height/2);
                                        mainContent.transition(0).delay(300).style('opacity', 1);
                                        **/

                                    }



                        });
                    } else {
                      arrow.interrupt()
                      .transition(100)//.attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0 : 1);
                      .attr('x', d => scaleX(d[1]))
                      .attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0 : 1);
                      //svg.select(`#${eachCharacter}meta`)
                      //          .select('.character-label-initial')
                      //          .attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0 : 1);

                      charMeta
                          .attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? .14 : 1);

                      selectAll(`.${eachCharacter}-label-text`).attr('opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 1 : 0);
                      select(`#${eachCharacter}-label-circle`)
                        .attr('fill-opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0.6 : 0);

                      function translateReset() {
                          //on('start') locked = TRUE
                          //on('end') locked = False
                          if (isSafari) {
                              select('.svg-main').transition().duration(1500).style('transform', `translate(0px,0px)`);
                          } else {
                              select('.svg-main').transition().duration(1500).attr('transform', `translate(0,0)`);
                          }
                      }

                      translateReset();
                      //transitions([1980, 2018], false, true);

                      //selectAll('.character-meta-inner').transition().duration(1000).attr('opacity', 1);


                    }


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
            let index = characterAges[eachCharacter + 'Ages'].idx;
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

        //dateRange is an array of length 2: e.g., [1900, 1980]
        function transitions(dateRange, makeVoronoi, filterOppoGender, indicatePOC, barOpacity) {
            if (!makeVoronoi) {
                document.querySelector('svg.svg-main').classList.add('mouse-disabled');
            }

            for (let eachChar in characterAges) {
                let {gender, color, idx} = characterAges[eachChar];
                characterAges[eachChar] = {gender: gender, color: color, idx: idx};
            }
            for (let eachChar in characterAgesArrays) {
                characterAgesArrays[eachChar] = [];
            }



            characters.forEach(character => {
                let characterName = character[0]['role'].toLowerCase().split(' ');
                if (characterName.length > 1) characterName[1] = characterName[1].charAt(0).toUpperCase() + characterName[1].substring(1);
                characterName = characterName.join('');
                processPoints(character, characterName, filterOppoGender, dateRange[0], dateRange[1]); //1900 to 1979
            });

            for (let char in characterAgesArrays) {
                const role = char.substring(0,char.length - 4);
                const ages = characterAgesArrays[char].sort((a,b) => a - b).filter(age => age > 10 && age < 90);
                const twentyFifthPercentile = quantile(ages, .25);
                const seventyFifthPercentile = quantile(ages, .75);
                interquartiles[role] = [ages[0], twentyFifthPercentile, seventyFifthPercentile, ages[ages.length-1]];
            }

            //select group
            const meta = svg.selectAll('.character-meta');
            //select circles
            //let data = processAllPointsAlt2();
            //console.log(data);

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

            pointsData = processAllPointsAlt3();
            console.log("here's test data: ", pointsData);
            //let points = svg.selectAll('.role-dots').data(data);
            const dotGroups = svg.selectAll('.role-dots-group').data(pointsData);

            dotGroups.enter();

            const transitionA = transition().duration(1500).ease(easeQuadInOut).on('end', () => {
                locked = false;
                if (makeVoronoi) {

                    document.querySelector('svg.svg-main').classList.remove('mouse-disabled');

                    let voronoifiedPoints = voronoifyDataPoints(pointsData);


                    const voronoiGen = voronoi()
                      .x(d => scaleX(d.age))
                      .y(d => d.charGender == 'male' ? male(d.charIndex, d.yCoord) : female(d.charIndex, d.yCoord))
                      .extent([[60, 15],[widthMax - 80, heightMax - 10]]);

                    //console.log('diagram', voronoiGen.polygons(voronoifiedPoints));

                    svg.append('g').attr('class', 'voronoi-overlay')
                      .selectAll('.path')
                      .data(voronoiGen.polygons(voronoifiedPoints))
                      .enter()
                      .append('path')
                      //.attr('id', d => d.data.id)
                      .attr('d', d => "M" + d.join("L") + "Z")
                      /**{
                        age: parseFloat(age),
                        role: role,
                        race: a['ethnicity'],
                        opening: a['opening_date'],
                        bday: a['formatted_bday'],
                        actorGender: a['actor_gender'],
                        actor: a['actor'],
                        isAgeEst: a['age_is_est'],
                        yCoord: Math.random(),
                        image: a['photo_url'],
                        bdayDataSource: a['bday_data_source']
                        }**/
                      .on('mouseover', d => {
                          //TODO: create temp variables based on data.
                          //how to create tooltip
                          //color
                          //how to display birthday
                          //console.log(event.pageX, event.pageY);
                          //console.log(mouse(document.querySelector('body')));


                          const containerCoords = {
                              top: 0,
                              left: 0,
                              right: windowWidth,
                              bottom: windowHeight
                          };

                          let leftAnchor, rightAnchor;
                          const tooltip = select('#tooltip');

                          function determinQuadrant(container, coordsToCheck) {
                            const {left, right, top, bottom} = container;
                            const xHalfway = (right - left)/2 + left;
                            const yHalfway = (bottom - top)/2 + top;


                            if (coordsToCheck[0] >= xHalfway && coordsToCheck[1] >= yHalfway) {
                                //lower right quad
                                console.log('LR');
                                tooltip.style('top', null).style('left', null);

                                tooltip
                                    .style('bottom', windowHeight - coordsToCheck[1] + 18 - windowHeight * .075)
                                    //.style('bottom', windowHeight - coordsToCheck[1])
                                    .style('right', windowWidth - (coordsToCheck[0] + (windowWidth - 1230)/2));
                            } else if (coordsToCheck[0] >= xHalfway && coordsToCheck[1] < yHalfway) {
                                //upper right quad
                                console.log('UR');
                                tooltip.style('bottom', null).style('left', null);
                                tooltip
                                    .style('top', coordsToCheck[1] +  windowHeight * .075 + 18)
                                    //.style('top', coordsToCheck[1] +  windowHeight * .075)
                                    .style('right', windowWidth - (coordsToCheck[0] + (windowWidth - 1230)/2));

                            } else if (coordsToCheck[0] < xHalfway && coordsToCheck[1] < yHalfway) {
                                //upper left quad
                                console.log('UL');
                                tooltip.style('bottom', null).style('right', null);
                                tooltip.style('top', coordsToCheck[1] +  windowHeight * .075 + 18)
                                    .style('left', coordsToCheck[0] + (windowWidth - 1230)/2 + 18);

                            } else if (coordsToCheck[0] < xHalfway && coordsToCheck[1] >= yHalfway) {
                                //lower left quad
                                console.log('LL');
                                tooltip.style('top', null).style('right', null);

                                tooltip.style('bottom', windowHeight - coordsToCheck[1] + 18 - windowHeight * .075)
                                    .style('left', coordsToCheck[0] + (windowWidth - 1230)/2 + 18);
                            }
                          }

                          //instead of mouse(), use dot locations
                          const x = scaleX(d.data.age);
                          const y = d.data.charGender == 'male' ? male(d.data.charIndex, d.data.yCoord) : female(d.data.charIndex, d.data.yCoord); //tooltip-container
                          determinQuadrant(containerCoords, [x, y]);

                          const imgLink = d.data.actor.image;
                          const imgLinkHTML = imgLink ? `<div class="tooltip-img-container"><img onerror="document.querySelector('.tooltip-img-container').style = 'display: none'; document.querySelector('.tooltip-container').style = 'width: 100%';" src="https://${imgLink}" /></div>` : '';

                          let pronoun;
                          if (d.data.actor.actorGender == 'male') {
                              pronoun = ['He','himself'];
                          } else if (d.data.actor.actorGender == 'female') {
                              pronoun = ['She','herself'];
                          } else {
                              pronoun = d.data.charGender === 'male' ? ['He','himself'] : ['She','herself'];
                          }

                          const ageIsEst = d.data.actor.isAgeEst == 'TRUE' ? true : false;
                          const genderBend = (d.data.charGender == 'male' && d.data.actor.actorGender == 'female' ||
                                                d.data.charGender == 'female' && d.data.actor.actorGender == 'male') ? true : false;

                          const genderBendText = genderBend ? `<p class='tooltip-details'><span class='tooltip-role-gender ${d.data.actor.role}-color'>${d.data.charGender == 'male' ? '\u2640' : '\u2642'}</span> <b>${d.data.actor.actor} is playing a character of a different gender</b></p>` : '';

                          let actorEthnicity;
                          let raceLine;
                          if (d.data.actor.race.match(/(B|b)lack/)) {
                              raceLine = 'is of African descent';
                          } else if (d.data.actor.race.match(/(L|l)atino/)) {
                              raceLine = 'is of Latino/Hispanic descent';
                          } else if (d.data.actor.race.match(/(A|a)sian/)) {
                              raceLine = 'is of Asian descent';
                          }

                          actorEthnicity = raceLine
                            ? `<section><svg class='inline-svg' height='12' width='13.85'><pattern id="stripe-3" patternUnits="userSpaceOnUse" width="4" height="4"><path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"/></pattern>
                            <mask id="mask-3"><rect height="100%" width="100%" style="fill: url(#stripe)" /></mask><polygon mask='url(#mask)' points='0,13 7.5,0 15,13' style="fill:${characterAges[d.data.actor.role + 'Ages'].color}"/></svg><span><b>${pronoun[0] + ' ' + raceLine}</b></span></section>`
                            : '';

                          //console.log(raceLine, actorEthnicity);

                          let productionInfoText;
                          if (d.data.actor.producers == "Shakespeare's Globe" && d.data.actor.opening.match('01-01') || d.data.actor.actor == 'Edith Evans') {
                            productionInfoText = `in ${moment(d.data.actor.opening).format("YYYY")}, and was approximately <b>${Math.floor(d.data.age)} years old</b>`;
                          } else if (moment(d.data.actor.opening) > moment(new Date())) {
                            productionInfoText = `that will open on ${moment(d.data.actor.opening).format("MMMM Do, YYYY")}, and will be ${ageIsEst ? 'approximately ' : ''}
                            <b>${Math.floor(d.data.age)} years old</b>`;
                          } else {
                            productionInfoText = `that opened on ${moment(d.data.actor.opening).format("MMMM Do, YYYY")}, and was ${ageIsEst ? 'approximately ' : ''}
                            <b>${Math.floor(d.data.age)} years old</b>`;
                          }

                          const directorText = d.data.actor.director == 'director unknown'
                            ? ''
                            : `directed by ${d.data.actor.director == d.data.actor.actor ? pronoun[1] : '<b>' + d.data.actor.director + '</b>'}`;
                          //Move the first two .attr lines to when initializing dots?
                          console.log(select(`#${d.data.id}`));
                          select(`#${d.data.id}`).attr('r', '10px')
                            .attr('stroke-width', '4px')
                            .attr('stroke', d => characterAges[d.role + 'Ages']['color'])
                            .attr('stroke-opacity', 1);

                          tooltip
                            .style('opacity', 1)
                            .style('width', '475px')
                            .style('height', 'auto')
                            //.style('background', 'white')
                            .style('border-top', `8px solid ${characterAges[d.data.actor.role + 'Ages'].color}`)
                            .html(`${imgLinkHTML}
                                    <div class='tooltip-container' style='width: ${imgLinkHTML ? '335px' : '100%'}'><p class='tooltip-main-content'><span class='tooltip-actor'><b>${d.data.actor.actor}</b></span> ${moment(d.data.actor.opening) > moment(new Date()) ? 'will play' : 'played'}
                                    <span class='tooltip-role ${d.data.actor.role}-color'>${formatCharacterName(d.data.actor.role)}</span> in a production of <em>${characterToPlayDict[d.data.actor.role]}</em>
                                    ${directorText} ${productionInfoText} at the time of the production.</p>
                                    <p class='tooltip-divider tooltip-details'><b>Production Company/Producers:</b> ${d.data.actor.producers}</p>
                                    <p class='tooltip-details'><b>Venue:</b> ${d.data.actor.theatre}</p>
                                    <p class='tooltip-details'>${d.data.actor.actor} was born
                                    ${ageIsEst ? 'in ~' + moment(d.data.actor.bday).year() : 'on ' + moment(d.data.actor.bday).format("MMMM Do, YYYY")} (<b><em>Source: </em></b>${d.data.actor.bdayDataSource})
                                    </p>
                                    ${actorEthnicity}
                                    ${genderBendText}
                                    </div>`)
                      }).on('mouseout', d => {
                          //3.6 3
                          //filteredDots.filter(dot => dot.race != 'unknown' && dot.race != 'none')

                          if (indicatePOC && d.data.actor.race != 'unknown' && d.data.actor.race != 'none') {
                             select(`#${d.data.id}`).attr('r', '6px');
                          } else if (select(`#${d.data.id}`).classed('tail-dot')) {
                              select(`#${d.data.id}`).attr('r', '3px');
                          } else {
                              select(`#${d.data.id}`).attr('r', '3.6px');
                          }

                          select(`#${d.data.id}`).attr('stroke-opacity', 0);

                          select('#tooltip')
                            .style('opacity', 0);
                      }).on('mousedown', d => {
                          event.stopPropagation();
                      });

                }
            }).on('start', function () {
                locked = true;
            });

            dotGroups.each(function(roleData, i) {
                const roleOppoGender = roleData['gender'] == 'male' ? 'female' : 'male';
                const matchGender = roleData.ages.filter(d => d.actorGender !== roleOppoGender);
                const oppoGender = roleData.ages.filter(d => d.actorGender === roleOppoGender);
                console.log(matchGender)
                console.log(oppoGender)

                const points = select(this).selectAll('.role-dots').data(matchGender);
                points.attr('mask', 'none');

                points.exit().remove();

                points.enter().append('circle').attr('class', 'role-dots')
                    .attr('class', d => {
                        return d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2]
                            ? 'role-dots center-50-dot'
                            : 'role-dots tail-dot';
                    })
                    .attr('id', (d, i) => `${d.role}-${d.tempID}`)
                    .attr('cx', d => scaleX(d.age))
                    .attr('cy', d => roleData.gender == 'male' ? male(roleData.index, d.yCoord) : female(roleData.index, d.yCoord))
                    .attr('r', d => {
                        if (indicatePOC && d.race != 'unknown' && d.race != 'none') return '6px';
                        return d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2] ? '3.6px' : '3px';
                    })
                    .attr('fill', d => roleData.color)
                    //.attr('stroke', d => roleData.color)
                    .attr('fill-opacity', 0)
					.attr('stroke-opacity', 0)
                    //.attr('filter', 'url(#blurMe)')
                    .transition(transitionA)
                    .attr('r', d => {
                        if (indicatePOC && d.race != 'unknown' && d.race != 'none') return '6px';
                        return d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2] ? '3.6px' : '3px';
                    })
                    .attr('fill-opacity', d => {
                        if (indicatePOC && d.race != 'unknown' && d.race != 'none') return .9;
                        return d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? .82 : .35;
                    });

                    //filteredDots.filter(dot => dot.race != 'unknown' && dot.race != 'none')
                        //.attr('r', '5px')
                        //.attr('mask', 'url(#mask)');

                points.transition(transitionA)
                    //.attr('class', 'role-dots')
                    .attr('id', (d, i) => `${d.role}-${d.tempID}`)
                    .attr('cx', d => scaleX(d.age))
                    .attr('cy', d => roleData.gender == 'male' ? male(roleData.index, d.yCoord) : female(roleData.index, d.yCoord))
                    //.attr('r', d => d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2] ? '3.6px' : '3px')
                    .attr('r', d => {
                        if (indicatePOC && d.race != 'unknown' && d.race != 'none') return '6px';
                        return d.age >= interquartiles[roleData.role][1] && d.age <= interquartiles[roleData.role][2] ? '3.6px' : '3px';
                    })
                    .attr('fill', d => roleData.color)
                    //.attr('stroke', d=> d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? 'rgba(40, 129, 129, 0.4)' : 'none')
                    .attr('fill-opacity', d => {
                        if (indicatePOC && d.race != 'unknown' && d.race != 'none') return .9;
                        return d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2] ? .82 : .35;
                    })

                    //.attr('stroke-opacity', 1)
                const pointsText = select(this).selectAll('.role-text-dots').data(oppoGender);

                pointsText.exit().remove();

                pointsText.enter().append('text')
                      .attr('id', d => `${d.role}-${d.tempID}`)
                      .attr('class', 'role-text-dots')
                      .attr('x', d => scaleX(d.age))
                      .attr('y', d => roleData.gender == 'male' ? male(roleData.index, d.yCoord) : female(roleData.index, d.yCoord))
                      .attr('fill', d => roleData.color)
                      .attr('stroke', d => roleData.color)
                      .attr('stroke-opacity', 0)
                      //.attr('mask', d => indicatePOC && d.race != 'unknown' && d.race != 'none' ? 'url(#mask)' : 'none')
                      //.attr('stroke-width', '2px')
                      .attr('fill-opacity', 1)
                      .attr('text-anchor', 'middle')
                      .attr('alignment-baseline', 'middle')
                      //.style('font-size', '14px')
                      .text(d => d.actorGender === 'male' ? '\u2642' : '\u2640')
                      .transition(transitionA)
                      .text(d => d.actorGender === 'male' ? '\u2642' : '\u2640');

                pointsText.transition(transitionA)
                    .attr('id', (d, i) => `${d.role}-${d.tempID}`)
                    .attr('x', d => scaleX(d.age))
                    .attr('y', d => roleData.gender == 'male' ? male(roleData.index, d.yCoord) : female(roleData.index, d.yCoord));


                selectAll('.role-dots').attr('mask', d => indicatePOC && d.race != 'unknown' && d.race != 'none' ? 'url(#mask)' : 'none');



                ///
                //select(this).selectAll('.oppo-roles').data(oppoGender).enter().append('text')
                //  .attr('class', 'role-text-dots')
                //  .attr('x', d => scaleX(d.age))
                //  .attr('y', d => roleData.gender == 'male' ? male(roleData.index) : female(roleData.index))
                //  .attr('fill', d => roleData.color)
                //  .attr('stroke', d => roleData.color)
                //  .attr('stroke-opacity', 0)
                //  .attr('fill-opacity', 0)
                //  .attr('text-anchor', 'middle')
                //  .attr('alignment-baseline', 'middle')
                //  //.style('font-size', '14px')
                //  .text(d => d.actorGender === 'male' ? '\u2642' : '\u2640');
                ///
            });




            for (let eachCharacter in interquartiles) {
                //).attr('id', eachCharacter + 'meta');
                let pad = 30;
                let radius = 21.5;

                let gender = characterAges[eachCharacter + 'Ages'].gender;
                let index = characterAges[eachCharacter + 'Ages'].idx;
                let yValue = gender == 'male' ? male(index, 0.5, true) : female(index, 0.5, true);

                let interquartileLine = line().y(d => yValue).x(d => scaleX(d));

                let middleFiftyPercent = interquartiles[eachCharacter].slice(1,3);

                const characterMeta = select('#' + eachCharacter + 'meta');


                if (barOpacity) {
                    characterMeta.select('.thick-line-quartile').attr('opacity', .35);
                }

                    characterMeta.select('.thick-line-quartile').datum(middleFiftyPercent).transition(transitionA)
                        .attr('d', interquartileLine);
                    characterMeta.select('.thin-line-quartile').datum([interquartiles[eachCharacter][0], interquartiles[eachCharacter][3]])
                        .transition(transitionA)
                        .attr('d', interquartileLine);

                    characterMeta.select('circle').transition(transitionA).attr('cx', () => {
                        //return (interquartiles[eachCharacter][3] < 80 ? scaleX(interquartiles[eachCharacter][3]) : scaleX(84)) + pad;
                        return scaleX(interquartiles[eachCharacter][3]) + pad;
                    });
                    const arcStartX = scaleX(interquartiles[eachCharacter][3]) - (radius + 3) + pad;
                    const arcEndX = scaleX(interquartiles[eachCharacter][3]) + (radius + 3) + pad;

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
                let index = characterAges[eachCharacter + 'Ages'].idx;
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
                            type: annotation.annotationCalloutCircle,
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
							dy: -20,
                            subject: {radius: 18}
						}
					];

			//const makeAnnotations = annotation.annotation()
          	//.type(annotation.annotationLabel)
          	makeAnnotations.annotations(annotations);

            select('.annotation-group')
                .call(makeAnnotations);

	      select('.annotation-note-label').attr('fill', '#b4b8c0');
          select('.annotation-connector path')
            .attr('stroke', '#b4b8c0')
            .attr('stroke-width', '2px');
          select('.annotation-connector path.connector-end')
            .attr('fill', '#b4b8c0')
            .attr('stroke', 'grey')
            .attr('stroke-width', '3px');

          select('.note-line').remove();

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

        //Highlight Patrick Stewart Othello
				//select('.highlight-1').on('click', highlight1);




        function skipToExplore() {
            const tickValues = [18, 20];

            while (tickValues[tickValues.length - 1] < 86) {
                let nextLabelVal = 86 - tickValues[tickValues.length - 1] < 10 ? 86 : tickValues[tickValues.length - 1] + 10;
                tickValues.push(nextLabelVal);
            }

            state = eventsQueue.length - 1;
            animateStop = true;
            select('.svg-main').style('opacity', 1);

            const mainContent = select('#main-content');
            mainContent.html(null);

            updateProgressBar();

            function createBracket(range, anchor, beamLength, thickness, className, label) {
                if (!document.querySelector(`.${className}`)) {
                    let bracket = svg.append('g').attr('class', className);
                    /**
                    bracket.append('rect').attr('x', 0).attr('y', range[0])
                        .attr('width', anchor)
                        .attr('height', range[1] - range[0])
                        .attr('fill', '#1a1b1e')
                        .attr('fill-opacity', .73);
                    **/

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
                        .style('letter-spacing', '1')
                        .attr('class', 'bracket-text')
                        .attr('x', anchor)
                        .attr('y', ((range[1]-range[0])/2) + range[0])
                        .attr('stroke', 'white')
                        .attr('text-anchor', 'middle')
                        .attr('transform', `rotate(270, ${anchor}, ${(range[1]-range[0])/2 + range[0]}) translate(0,-10)`)
                        .text(label);

                }
            }


            if (!document.querySelector('.axis')) {
                svg.append('g')
                    .attr('class', 'x axis')
                    .attr('opacity', 0)
                                        //.attr('transform', `translate(0,${heightMax/2 - 10})`)
                 .call(axisBottom(scaleX).tickValues(tickValues).tickSize(heightMax - 25))
                  .transition(2000)
                  .attr('opacity', 1)

                                    selectAll('.axis .tick text')
                  .attr('transform', `translate(0,-${(band * 9) + 18})`);

                                    selectAll('.axis .tick line')
                                        .attr('stroke-dasharray', '2,2')
                                        .attr('stroke-opacity', .2)
                                        .attr('transform', `translate(0,15)`);

                select('.domain').remove();

                const ageAxis = document.querySelector('.axis');

                //invisible rect
                svg.append('rect').attr('x', 0).attr('y', 15)
                    .attr('width', 40)
                    .attr('height', heightMax - 25)
                    .attr('fill', '#1a1b1e')
                    .attr('fill-opacity', .92);

                const axisLabel = svg.append('text').attr('y', ageAxis.getBoundingClientRect().top - document.querySelector('.svg-main').getBoundingClientRect().top)
                    .attr('x', (ageAxis.getBoundingClientRect().left - document.querySelector('.svg-main').getBoundingClientRect().left)/2)
                    .attr('text-anchor', 'middle')
                    .attr('stroke', '#a6abb5')
                    .attr('font-size', '9px')
                    .attr('transform', `translate(0,${band * 7 + 13})`)


                axisLabel.append('tspan').attr('y', ageAxis.getBoundingClientRect().top - document.querySelector('.svg-main').getBoundingClientRect().top)
                    .attr('x', (ageAxis.getBoundingClientRect().left - document.querySelector('.svg-main').getBoundingClientRect().left)/2)
                    .text('AGE OF ACTOR')
                    .style('letter-spacing', '1')
                    .attr('dy', '8px');
                axisLabel.append('tspan').attr('y', ageAxis.getBoundingClientRect().top - document.querySelector('.svg-main').getBoundingClientRect().top)
                    .attr('x', (ageAxis.getBoundingClientRect().left - document.querySelector('.svg-main').getBoundingClientRect().left)/2)
                    .text('DURING PRODUCTION')
                    .style('letter-spacing', '1')
                    .attr('dy', '23px');//.append('tspan').attr('class', 'note-indicator').text('*');


                    /*
                    .append('tspan')
                    .attr('class', 'note-indicator')
                    .text('*')
                    .attr('font-size', '12px');
                    //.attr('baseline-shift', 'super');
                    */

            } else {
                svg.select('g.axis').transition(2000)
                    .call(axisBottom(scaleX)
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

            //createBracket([15, heightMax/2 - 25], 40, 9, 4, 'female-bracket', 'FEMALE ROLES');
              //createBracket([heightMax/2 + 25, heightMax - 10], 40, 9, 4, 'male-bracket', 'MALE ROLES');
            createBracket([15, (band * 7) + 15], 40, 9, 4, 'female-bracket', 'FEMALE ROLES');
            createBracket([(band * 7) + 15 + 50, heightMax - 10], 40, 9, 4, 'male-bracket', 'MALE ROLES');



            eventsQueue[eventsQueue.length - 2][0]();
            selectAll('.character-meta-inner').attr('opacity', 1);
            selectAll('.character-label-initial').attr('opacity', 0);
            selectAll('.arrow').attr('opacity', 0);

            selectAll('.label-text').attr('opacity', 1).select('textPath').attr('opacity', 1);
            selectAll('.character-meta').select('circle').attr('fill-opacity', 0.6);

            //.attr('fill-opacity', d => d[0] == d[1] || maxAge >= fullCharacterAgesRange[3] ? 0.6 : 0);




        }

        const eventsQueue = [
            [function(directionForward) {
                //stop shakespeare interval animation timer
                animateStop = true;

                const left = +document.querySelector('.svg-main').getBoundingClientRect().left;
                const right = +document.querySelector('.svg-main').getBoundingClientRect().right;
                let mainContent = select('#main-content');
                mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);
                //BAND IS DYNAMIC, but HEIGHT OF EMBEDDED SVG is static
                //mainContent.html(`<p>Let\'s explore the age distributions of actors playing various prominent roles from the 10 plays mentioned earlier. We can think of the historical range of ages of actors playing a certain role as <em>the window of opportunity</em> for any actor who wants to play that role. That is, if most <span class="hamlet-color">Hamlets</span> have been played by actors in their 30s, then an actor in his 30s has a much better chance of being cast in an upcoming production than an actor in his 50s. <b><em>At any given age, what roles are open to you as an actor?</em></b></p><p>We’ll first look at only <b>productions from 1980 onwards</b>&#8212we\'ll come back to the full dataset in a bit&#8212since more recent performances are more representative of the conditions and environment that an actor would face today.</p><p class="legend-prompt">How to read the chart:</p><svg class="embedded-svg" width=${right-left} height=300></svg>`);
                mainContent.html(`<div class='quote-container'><p class='quote'><em>All the world's a stage,</em></p>
                                  <p class='quote'><em>And all the men and women merely players;</em></p>
                                  <p class='quote'><em>They have their exits and their entrances,</em></p>
                                  <p class='quote'><em>And one man in his time plays many parts,</em></p>
                                  <p class='quote'><em>His acts being seven ages.</em></p>
                                  <p class='quote quote-author'><b>&mdash; William Shakespeare</b>, <em>As You Like It</em> (II.vii.139-143)</p></div>
                                  <p class='story'>It's the beginning of a new academic year. You're an 18-year-old actor about to start school at a competitive drama program like Juilliard or RADA. Your idols are actors like Sir Ian McKellen, Oscar Isaac, and Dame Maggie Smith. You dream of reaching iconic status in pop culture-dom by landing roles in major film &amp; TV franchises like <em>The Avengers</em> or <em>Game of Thrones</em>, while maintaining a parallel career in theatre.</p>
                                  <p class='story'>If you’re hoping to have a career in theatre, you’re going to have a hard time avoiding the outsized presence of the Bard himself. For the 2017-18 theatrical season, <em>American Theatre</em> <a href='https://www.americantheatre.org/2017/09/21/the-top-20-most-produced-playwrights-of-the-2017-18-season/' target='_blank'>calculated that out of 1,917 productions by member theaters of the Theatre Communications Group, 108 (a little under 6%) were works by Shakespeare</a>, making him the most performed playwright in the survey, with quadruple the number of productions as the playwright in second place.</p>
                                  <p class='story'>What does the future hold for you as an aspiring Shakespearean? As it turns out, your fate largely depends on your gender...</p>`);
                //mainContent.html(`<p>Let’s get acquainted with how to navigate through this article. <span>CLICK</span> anywhere to get started. To progress through the story, use the <span class='key-indicator'>&#x21e8;</span> or <span>SPACE</span> keys on your keyboard, and <span class='key-indicator'>&#x21e6;</span> to go back. You can also click on the right or left sides of the page to navigate. </p><svg class="embedded-svg" width=${right-left} height=300></svg>`);
                console.log(band);
                const height = +document.querySelector('#main-content').getBoundingClientRect().height;
                mainContent.style('top', window.innerHeight/2 - height/2);

            }],
          [function() {

            const band = 55;

            const left = +document.querySelector('.svg-main').getBoundingClientRect().left;
            const right = +document.querySelector('.svg-main').getBoundingClientRect().right;
            const mainContent = select('#main-content');
            mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);
            //BAND IS DYNAMIC, but HEIGHT OF EMBEDDED SVG is static
            //mainContent.html(`<p>Let\'s explore the age distributions of actors playing various prominent roles from the 10 plays mentioned earlier. We can think of the historical range of ages of actors playing a certain role as <em>the window of opportunity</em> for any actor who wants to play that role. That is, if most <span class="hamlet-color">Hamlets</span> have been played by actors in their 30s, then an actor in his 30s has a much better chance of being cast in an upcoming production than an actor in his 50s. <b><em>At any given age, what roles are open to you as an actor?</em></b></p><p>We’ll first look at only <b>productions from 1980 onwards</b>&#8212we\'ll come back to the full dataset in a bit&#8212since more recent performances are more representative of the conditions and environment that an actor would face today.</p><p class="legend-prompt">How to read the chart:</p><svg class="embedded-svg" width=${right-left} height=300></svg>`);
            mainContent.html(`<p class='legend-text'><b>Before we go any further, let's get better acquainted with how to navigate this story. To keep going, use the  <span class='key-indicator'>&#x21e8;</span>  key or  <span class='key-indicator'>&nbsp;SPACE&nbsp;</span>  bar on your keyboard, and  <span class='key-indicator'>&#x21e6;</span>  to go back. Alternatively, you can also CLICK on the right or left sides of the page to navigate.</b></p><p class='legend-text'>For this story, data from over 1,000 professional productions in the <a href="https://en.wikipedia.org/wiki/Anglosphere" target="_blank">Anglosphere</a> of 10 Shakespearean plays since 1900 was collected, including <em>Hamlet</em>, <em>Othello</em>, <em>Macbeth</em>, <em>King Lear</em>, <em>Romeo and Juliet</em>, <em>Antony and Cleopatra</em>, <em>The Tempest</em>, <em>The Merchant of Venice</em>, <em>As You Like It</em>, and <em>Richard III</em>. We chose these plays in part to ensure that we have a <a target='_blank' href="https://www.theguardian.com/stage/interactive/2012/dec/10/shakespeare-women-interactive">relatively balanced and representative group of major female and male roles</a>.</p><p class='legend-text'>Each character comes with an age distribution chart, where each dot ( <span class='legend-dot'></span> ) represents an actor playing the role in a particular production, and they’re plotted on the chart based on their age at the time of the production. Some actors have played the same role on multiple occasions in different productions. In such cases, each production with the same actor is represented by a separate dot. <b>Here's how to read the age distribution charts:</b></p><svg class="embedded-svg" width=${right-left} height=240></svg>`);
            //mainContent.html(`<p>Let’s get acquainted with how to navigate through this article. <span>CLICK</span> anywhere to get started. To progress through the story, use the <span class='key-indicator'>&#x21e8;</span> or <span>SPACE</span> keys on your keyboard, and <span class='key-indicator'>&#x21e6;</span> to go back. You can also click on the right or left sides of the page to navigate. </p><svg class="embedded-svg" width=${right-left} height=300></svg>`);
            const height = +document.querySelector('#main-content').getBoundingClientRect().height;
            let test = window.innerHeight/2 - height;
            mainContent.style('top', window.innerHeight/2 - height/2);
            const embedSVG = select('.embedded-svg');
            //generate random ages; 40 data points

            function generateAgesQuantized() {
              let arrOfAges = [];
              for (let i=0; i<40; i++) {
                if (i < 10) {
                  arrOfAges.push(Math.ceil(Math.random() * 10) + 20);
                } else if (i >= 10 && i <= 31) {
                  arrOfAges.push(Math.ceil(Math.random() * 28) + 20);
                } else {
                  arrOfAges.push(Math.ceil(Math.random() * 45) + 20);
                }
              }
              return arrOfAges;
            }
            function generateAges() {
              let arrOfAges = [];
              for (let i=0; i<40; i++) {
                if (i < 10) {
                  arrOfAges.push((Math.random() * 10) + 20);
                } else if (i >= 10 && i <= 31) {
                  arrOfAges.push((Math.random() * 28) + 20);
                } else {
                  arrOfAges.push((Math.random() * 45) + 20);
                }
              }
              return arrOfAges;
            }
            let sortedSampleAges = generateAges().sort((a,b) => a - b);
            let sampleInterquartiles = [sortedSampleAges[0], quantile(sortedSampleAges, 0.25), quantile(sortedSampleAges, 0.75), sortedSampleAges[sortedSampleAges.length - 1]];

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
              .attr('r', d => d >= sampleInterquartiles[1] && d <= sampleInterquartiles[2] ? '3.6px' : '3px')
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

            //svg.append('g')
            //    			.attr('class', 'x axis')
            //        	.attr('opacity', 0)
						//					//.attr('transform', `translate(0,${heightMax/2 - 10})`)
            //    			.call(axisBottom(scaleXNew).tickValues([18, 20, 22]).tickSize(heightMax - 25))
            //          .transition(2000)
            //          .attr('opacity', 1)
						//
						//				selectAll('.axis .tick text')
            //          .attr('transform', `translate(0,-${(band * 9) + 18})`);

						//				selectAll('.axis .tick line')
						//					.attr('stroke-dasharray', '2,2')
						//					.attr('stroke-opacity', .2)
						//					.attr('transform', `translate(0,15)`);

            //        select('.domain').remove();



            sampleMeta.append('text').datum([sampleInterquartiles[0], sampleInterquartiles[3]])
              .attr('x', d => scaleX(d[0]) - 5)
              .attr('y', 125)
              .attr('stroke', '#1c6582')
              .attr('alignment-baseline', 'middle')
              .attr('text-anchor', 'end')
              .attr('class', 'legend-character-label-initial')
              .style('letter-spacing', '1.5')
              .text('Example Character');

            const braceFullCoords = makeCurlyBrace(scaleX(sampleInterquartiles[3]), 85, scaleX(sampleInterquartiles[0]), 85, 30, 0.54);
            sampleMeta.append('path')
              .classed('curly-brace-full', true)
              .attr('d', braceFullCoords)
              .attr('stroke', '#d4cdda')
              .attr('stroke-width', '2px')
              .attr('fill', 'none');

            sampleMeta.append('text')
              .attr('x', (scaleX(sampleInterquartiles[3]) - scaleX(sampleInterquartiles[0]))/2 + scaleX(sampleInterquartiles[0]))
              .attr('y',  38)
              .attr('stroke', '#d4cdda')
              .attr('text-anchor', 'middle')
              .text('Full range of ages of actors when playing this role');

            const braceInterquartileCoords = makeCurlyBrace(scaleX(sampleInterquartiles[1]), 140, scaleX(sampleInterquartiles[2]), 140, 30, 0.54);
            sampleMeta.append('path')
              .classed('curly-brace-interquartile', true)
              .attr('d', braceInterquartileCoords)
              .attr('stroke', '#d4cdda')
              .attr('stroke-width', '2px')
              .attr('fill', 'none');

            sampleMeta.append('text')
              .attr('x', (scaleX(sampleInterquartiles[2]) - scaleX(sampleInterquartiles[1]))/2 + scaleX(sampleInterquartiles[1]))
              .attr('y', 185)
              .attr('stroke', '#d4cdda')
              .attr('text-anchor', 'middle')
              .text('Interquartile range (i.e., middle 50%) of actor ages');



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


            const sampleAxis = embedSVG.append('g').attr('class', 'x sample-axis');

            const heightToShift = document.querySelector('.curly-brace-full').getBoundingClientRect().bottom - document.querySelector('.embedded-svg').getBoundingClientRect().top;

            console.log('to shift: ' + heightToShift);
            sampleAxis.attr('transform', `translate(0,${heightToShift})`);

            sampleAxis
              .call(axisBottom(scaleX)
                    .tickValues([18, sampleInterquartiles[0], median(sortedSampleAges), sampleInterquartiles[2], sampleInterquartiles[3]])
                    .tickSize(band + 75));

            selectAll('.sample-axis .tick line')
	           .attr('stroke-dasharray', '2,2')
	           .attr('stroke-opacity', .2);

            select('.domain').remove();


            const legendAnnotations = [
					   	//note color: #b4b8c0
              {
                note: {
                  label: 'Oldest actor playing role in sample',
                  wrap: 200,
                  align: 'left'
                },
                connector: {
                  end: 'arrow',
                  type: 'curve',
                  points: [[38, -9]]
                },
                x: scaleX(sampleInterquartiles[3]) + 4,
                y: document.querySelector('.sampleRole').querySelectorAll('circle')[39].getAttribute('cy'),
                dx: 65,
                dy: -30
              },
              {
                note: {
                  title: '75th %tile of ages',
                  label: 'By this age, you\'d be older than 75% of all actors who\'ve played this character in our sample',
                  wrap: 180,
                  align: 'left'
                },
                connector: {
                  end: 'arrow',
                  type: 'curve',
                  points: [[55, 25]]
                },
                x: scaleX(sampleInterquartiles[2]),
                y: 125,
                dx: 125,
                dy: 20
              }
            ];

            const makeLegendAnnotations = annotation.annotation()
              .type(annotation.annotationLabel)
              .annotations(legendAnnotations);

            embedSVG
              .append("g")
              .attr("class", "annotation-group")
              .call(makeLegendAnnotations);

            selectAll('.annotation-note-title').attr('stroke', '#d4cdda').style('font-weight', 400);
            selectAll('.annotation-note-label').attr('stroke', '#908e8e');
            selectAll('.annotation-connector path.connector')
              .attr('stroke', '#b4b8c0')
              .attr('stroke-width', '1px')
              .attr('stroke-dasharray', '2,4');
            selectAll('.annotation-connector path.connector-end')
              .attr('fill', '#b4b8c0')
              .attr('stroke', '#b4b8c0')
              .attr('stroke-width', '1px');

            select('.svg-main').style('opacity', 0);

          }, 'From ages 17 to 22..'],
          [function(directionForward) {
            select('.svg-main').style('opacity', 1);

            const left = (+document.querySelector('.svg-main').getBoundingClientRect().left) + (+scaleX(23)) + 82;
            const right = +document.querySelector('.svg-main').getBoundingClientRect().right - 10;
            animateDots(17, 23, directionForward)();
            let mainContent = select('#main-content');
            //`position: fixed; top: 0; left: 400`
            // To answer that question, let’s look at a representative sample of productions of 10 of Shakespeare’s major plays and try to tease out trends in the casting of the lead roles. For now, we’ll limit our sample to productions from 1980 onward, as it’s more representative of modern casting practices.
            mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);
            mainContent.html(`<h2>From age 18 to 23 <span>productions since 1980</span></h2><p>For now, we'll limit our focus to productions from 1980 onwards, since these are more representative of modern casting practices. There are few Shakespearean lead roles available to the university-age actor in professional productions, with the obvious exceptions of <span class="romeo-color">Romeo</span> and <span class="juliet-color">Juliet</span>. <span class="juliet-color">Juliet</span> is <a href="https://en.wikipedia.org/wiki/Juliet#Juliet\'s_age" target="_blank">described as a girl of 13</a> in Shakespeare’s original text and <span class="romeo-color">Romeo</span> is likely just a few years older; they’re undoubtedly the youngest of Shakespeare’s protagonists. There are a few early-20s <span class="hamlet-color">Hamlets</span> and <span class="rosalind-color">Rosalinds</span>, but you’d have to be a rare (and very, very lucky) <a href="https://www.newcanaannewsonline.com/news/article/New-Canaan-director-to-helm-Hamlet-6821035.php" target="_blank">anomaly</a> to be cast in one of these roles.</p>`);
            mainContent.style('opacity', 0);
            const height = +document.querySelector('#main-content').getBoundingClientRect().height;
            mainContent.style('top', window.innerHeight/2 - height/2);
            mainContent.transition().delay(300).style('opacity', 1);
          }],
          [function(directionForward) {
            const left = (+document.querySelector('.svg-main').getBoundingClientRect().left) + (+scaleX(30)) + 82;
            const right = +document.querySelector('.svg-main').getBoundingClientRect().right - 10;
            animateDots(23, 30, directionForward)();
            let mainContent = select('#main-content');
            mainContent.style('opacity', 0);

            mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);
            mainContent.html('<h2>From age 24 to 30 <span>productions since 1980</span></h2><p>As an actor, your Shakespearean career is now in full swing. We start to see all sorts of opportunities open up for both actors and actresses. You would still be on the younger end for <span class="hamlet-color">Hamlet</span> or <span class="othello-color">Othello</span> or <span class="portia-color">Portia</span>, but your mid-to-late 20s is your best chance to snag the role of <span class="romeo-color">Romeo</span> or <span class="juliet-color">Juliet</span>. By the time you hit 30, you’re close to aging out of the parts of everyone\'s favorite tragic young lovers: you’d be older than 75+% of the actors who\'ve played these two roles in our dataset.</p>');
            const height = +document.querySelector('#main-content').getBoundingClientRect().height;
            mainContent.style('top', window.innerHeight/2 - height/2);
            mainContent.transition(0).delay(300).style('opacity', 1);
          }],
          [function(directionForward) {
            const left = (+document.querySelector('.svg-main').getBoundingClientRect().left) + (+scaleX(45)) + 109;
            const right = +document.querySelector('.svg-main').getBoundingClientRect().right - 10;
            //animateDots(31, 45, directionForward, true)();
            animateDots(30, 45, directionForward)();
            let mainContent = select('#main-content');
            mainContent.style('opacity', 0);

            mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);
            mainContent.html(`<h2>From age 31 to 45 <span>productions since 1980</span></h2><p>Between 31 and 45 is when we start to see signs of divergence between opportunities for men and women. As a 45-year-old actress, you’d be older than any recorded <span class="rosalind-color">Rosalind</span> or <span class="portia-color">Portia</span> since 1980 in our sample. Even in the case of <span class="ladyMacbeth-color">Lady Macbeth</span>, a rather juicy role for more seasonsed actresses, by 45, an actress would already be older than over 75% of her peers who’ve played the role. At the same age, an actor is still squarely in the interquartile ranges of the roles of <span class="othello-color">Othello</span>, <span class="iago-color">Iago</span>, <span class="macbeth-color">Macbeth</span>, and <span class="richardIii-color">Richard III</span>, all parts played by similar mid-career males. The only lead Shakespearean female role with a similar age distribution as these male roles is <span class='cleopatra-color'>Cleopatra</span>. Sadly, <em>Antony and Cleopatra</em> is also less frequently produced than many of Shakespeare's other plays.</p>`);
            const height = +document.querySelector('#main-content').getBoundingClientRect().height;
            mainContent.style('top', window.innerHeight/2 - height/2);
            mainContent.transition(0).delay(300).style('opacity', 1);

          }],
          [function(directionForward) {
            const left = (+document.querySelector('.svg-main').getBoundingClientRect().left) + (+scaleX(66)) + 82;
            const right = +document.querySelector('.svg-main').getBoundingClientRect().right - 10;

            animateDots(45, 66, directionForward)();
            const mainContent = select('#main-content');

            mainContent.style('opacity', 0);
            mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);

            mainContent.html('<h2>From age 46 to 66 <br><span>productions since 1980</span></h2><p>By the time you hit retirement age as an actress, you’re basically out of female roles to play. Contrast this with the major male roles like <span class="kingLear-color">King Lear</span> or <span class="shylock-color">Shylock</span>, where at 66, you’re still younger than at least 25% or more of the actors who have played the parts.</p>');
            const height = +document.querySelector('#main-content').getBoundingClientRect().height;

            mainContent.style('top', window.innerHeight/2 - height/2);
            mainContent.transition(0).delay(300).style('opacity', 1)

          }],
          [function(directionForward) {
            const mainContent = select('#main-content');

            if (directionForward) {
                animateDots(66, 86, directionForward, true)();
                mainContent.html(null);
            } else {
                transitions([1980, 2019], false, true);
                mainContent.style('opacity', 0);

                //mainContent.style('opacity', 0);
                mainContent.style('width', 1230);
                mainContent.style('left', (window.innerWidth - 1230)/2 + 20);
                //mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);

                mainContent.html(`<h2>Female role age distributions in <span>productions since 1980</span></h2><p>In recent decades, as an actress, you've have had a rather narrow window (around two decades or so starting in your late teens) to play some of the most substantive Shakespearean female roles.
                <span class='ladyMacbeth-color'>Lady Macbeth</span> and <span class='cleopatra-color'>Cleopatra</span> aside, if you’re an actress who wants a staring turn in Shakespeare,
                you pretty much have to do so before you turn 40. You might think that there is nothing surprising about this, given that these characters are all young, and naturally, the actresses cast should also be on the younger end.
                But interestingly enough, this wasn’t always the case.</p>`);
                const height = +document.querySelector('#main-content').getBoundingClientRect().height;
                const topOfSVGContainer = +document.querySelector('.svg-main').getBoundingClientRect().top;

                mainContent.style('top', (topOfSVGContainer - height)/2);
                mainContent.transition(1000).style('opacity', 1);

                //mainContent.style('top', window.innerHeight/2 - height/2);
                //mainContent.transition(0).delay(300).style('opacity', 1);
            }


            /**
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

            });**/

          }],

          [function(directionForward) {
              const mainContent = select('#main-content');
              mainContent.style('opacity', 0);

              if (directionForward) {
                  transitions([1900, 1980], false, true);
                  changeMainContent();
                  /**

                  selectAll('.role-dots-group').filter(g => {
                      return g.gender == 'female';
                  }).each(group => {

                      select(`.${group.role}-dots-group`).selectAll('.role-dots')
                      .filter(d => {
                          //console.log(moment(d.opening), moment("1951"));
                          return moment(d.opening) < moment("1951");
                      })
                      .each(d => {
                          console.log(d);
                          select('.svg-main').append('circle').datum(d).classed('call-out-dot', true)
                            .attr('fill-opacity', 0)
                            .attr('stroke-opacity', .5)
                            .attr('stroke-dasharray', '2 1')
                            .attr('stroke-width', 1)
                            .attr('stroke', 'white')
                            .attr('cx', d => scaleX(d.age))
                            .attr('cy', d => group.gender == 'male' ? male(group.index, d.yCoord) : female(group.index, d.yCoord))
                            .attr('r', 8);
                        });

                  });**/


              } else {
                  function translateDown() {
                      const transitionDown = transition().duration(1500).on('end', function() {
                          locked = false;
                          changeMainContent();

                      }).on('start', function() {
                          locked = true;
                      });
                      if (isSafari) {
                          select('.svg-main').transition(transitionDown).style('transform', `translate(0px,${band * 9 + 20}px)`);
                      } else {
                          select('.svg-main').transition(transitionDown).attr('transform', `translate(0,${band * 9 + 20})`);
                      }
                      //selectAll('.role-dots-group').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                      //selectAll('.character-meta-inner').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                      //selectAll('.character-label-initial').attr('stroke', 'rgb(255,255,255)');
                      //selectAll('.axis').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                  }
                  translateDown();
              }

              function changeMainContent() {
                  mainContent.style('width', 1230);
                  mainContent.style('left', (window.innerWidth - 1230)/2 + 20);
                  //mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);

                  mainContent.html(`<h2>Female role age distributions in <span>productions between 1900-1979</span></h2><p>Things were quite different in the early decades of the 20th century.
                      Actresses in their late 30s and their 40s were regularly cast in, or played roles such as <span class='rosalind-color'>Rosalind</span> and <span class='portia-color'>Portia</span> (as opposed to being outliers near the end of the upper quartile of ages),
                      and it was not uncommon to see <span class='juliet-color'>Juliets</span> and <span class='desdemona-color'>Desdemonas</span> in their 40s either. In general, the spreads (or statistical dispersion, for the geeks)
                      of the ages of actresses in almost all the roles were much wider (ranging from 10 to 20 years wider) prior to 1980, and in particular, prior to the 1950s. </p>`);
                  const height = +document.querySelector('#main-content').getBoundingClientRect().height;
                  const topOfSVGContainer = +document.querySelector('.svg-main').getBoundingClientRect().top;

                  mainContent.style('top', (topOfSVGContainer - height)/2);
                  mainContent.transition(1000).style('opacity', 1);
              }



          }],
          [function(directionForward) {
              const mainContent = select('#main-content');
              mainContent.style('opacity', 0);
              mainContent.style('width', 1230);
              mainContent.style('left', (window.innerWidth - 1230)/2 + 20);

              function translateUp() {
                  const transitionUp = transition().duration(1500).on('end', function () {
                      locked = false;
                      mainContent.transition(1000).style('opacity', 1);
                      mainContent.html(`<h2>Male role age distributions in <span>productions between 1900-1979</span></h2><p>This more relaxed attitude towards verisimilitude was also true with male roles, but in the opposite direction.
                          If it surprises you to think a 45-year-old actress can be cast as <span class='juliet-color'>Juliet</span>, it might also shock you when looking at the age distributions of actors playing <span class="kingLear-color">King Lear</span> or <span class="prospero-color">Prospero</span> pre-1980.
                          Actors in their 30s and 40s used to regularly perform these roles the modern theater-goer has been conditioned into thinking are the exclusive province of old men. In fact, the age distribution of <span class="kingLear-color">King Lear</span> during this period is barely differentiable from
                          those of <span class="macbeth-color">Macbeth</span> or <span class="othello-color">Othello</span>.</p>`);
                      const height = +document.querySelector('#main-content').getBoundingClientRect().height;
                      const bottomOfSVGContainer = +document.querySelector('.svg-main').getBoundingClientRect().bottom;
                      console.log(document.querySelector('body').getBoundingClientRect());
                      mainContent.style('top', (window.innerHeight - bottomOfSVGContainer - height)/2 + bottomOfSVGContainer - 15);

                  }).on('start', function() {
                      locked = true;
                  });
                  //select('.svg-main').transition().duration(2100).attr('transform', `translate(0,-${band * 9})`);
                  if (isSafari) {
                      select('.svg-main').transition(transitionUp).style('transform', `translate(0px,-${band * 7 + windowHeight * .075 + 10}px)`);
                  } else {
                      select('.svg-main').transition(transitionUp).attr('transform', `translate(0,-${band * 7 + windowHeight * .075 + 10})`);
                  }



                  //selectAll('.role-dots-group').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                  //selectAll('.character-meta-inner').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                  //selectAll('.character-label-initial').attr('stroke', 'rgb(255,255,255)');
                  //selectAll('.axis').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
              }

              if (directionForward) {
                  translateUp();
              } else {
                  transitions([1900,1980], false, true);
                  mainContent.transition(1000).style('opacity', 1);
                  mainContent.html(`<h2>Male role age distributions in <span>productions between 1900-1979</span></h2><p>This more relaxed attitude towards verisimilitude was also true with male roles, but in the opposite direction.
                      If it surprises you to think a 45-year-old actress can be cast as <span class='juliet-color'>Juliet</span>, it might also shock you when looking at the age distributions of actors playing <span class="kingLear-color">King Lear</span> or <span class="prospero-color">Prospero</span> pre-1980.
                      Actors in their 30s and 40s used to regularly perform these roles the modern theater-goer has been conditioned into thinking are the exclusive province of old men. In fact, the age distribution of <span class="kingLear-color">King Lear</span> during this period is barely differentiable from
                      those of <span class="macbeth-color">Macbeth</span> or <span class="othello-color">Othello</span>.</p>`);
                  const height = +document.querySelector('#main-content').getBoundingClientRect().height;
                  const bottomOfSVGContainer = +document.querySelector('.svg-main').getBoundingClientRect().bottom;
                  console.log(document.querySelector('body').getBoundingClientRect());
                  mainContent.style('top', (window.innerHeight - bottomOfSVGContainer - height)/2 + bottomOfSVGContainer - 15);
              }
              /**
              if (directionForward) {
                  selectAll('.character-meta-inner').transition().duration(1000).attr('opacity', 1);
                  selectAll('.role-dots').transition().duration(1000).attr('fill-opacity', d => {
                      //if (d.age <= maxAge && d.age >= minAge) {
                      if (d.age >= interquartiles[d.role][1] && d.age <= interquartiles[d.role][2]) {
                          //console.log('good');
                          return .95;
                      } else {
                          return .4;
                      }
                      /**
                      } else {
                          console.log('invisible');
                          return 0;
                      }

                  });
              } else {
                  transitions([1980, 2018], false, true);
              }
              **/
              /**
              const blankAnnotations = [
                  //note color: #b4b8c0
                  {
                      type: annotation.annotationLabel,
                      note: {
                          //label: 'Test text for this annotation. Somethings about Othello and Iago and race and ethnicity. This surprisingly does not look ugly thank you haha. I was worried. We can definitely work with this. Images might work better outside of SVG',
                          label: '',
                      },

                      x: 0,
                      y: 0,

                  }
              ];

              makeAnnotations.annotations(blankAnnotations);

              select('.annotation-group')
                .call(makeAnnotations);

              //create voronoi overlay as Test
              //voronoifiedPoints
              //.attr('cx', d => scaleX(d.age))
              //.attr('cy', d => roleData.gender == 'male' ? male(roleData.index, d.yCoord) : female(roleData.index, d.yCoord))
              **/
          }],
          [function(directionForward) {
              //select('.svg-main').transition().duration(2100).attr('transform', `translate(0,0)`);
              /**
              if (isSafari) {
                  select('.svg-main').transition().duration(1500).style('transform', `translate(0px,0px)`);
              } else {
                  select('.svg-main').transition().duration(1500).attr('transform', `translate(0,0)`);
              }
              **/
              const mainContent = select('#main-content');
              mainContent.style('opacity', 0);

              if (directionForward) {
                  transitions([1980, 2019], false, false);
              }

              selectAll('.role-text-dots').attr('opacity', 0);

              mainContent.html(`<h2>Male role age distributions in <span>productions since 1980</span></h2><p>Perhaps due to both improvements in
                  <a href='http://budgetmodel.wharton.upenn.edu/issues/2016/1/25/mortality-in-the-united-states-past-present-and-future' target="_blank">life expectancy</a> in the late 20th century, and increasing audience expectations
                  for an actor’s age to match the age of the character he’s playing (likely due to the pressures from film and TV), nearly 75% of modern-day actors playing <span class="kingLear-color">King Lear</span> are over 60,
                  a considerable change from productions prior to the 1980s. While it’s true that the age distributions of younger male roles like <span class="romeo-color">Romeo</span> and <span class="hamlet-color">Hamlet</span> have
                  also contracted in recent years, with the average ages of <span class="kingLear-color">King Lears</span> and <span class="prospero-color">Prosperos</span> trending upward, male actors continue to have
                  pretty healthy pickings of Shakespearean roles throughout their careers.</p>`);
              const height = +document.querySelector('#main-content').getBoundingClientRect().height;
              const bottomOfSVGContainer = +document.querySelector('.svg-main').getBoundingClientRect().bottom;
              console.log(document.querySelector('body').getBoundingClientRect());
              mainContent.style('top', (window.innerHeight - bottomOfSVGContainer - height)/2 + bottomOfSVGContainer - 15);
              mainContent.transition(1000).style('opacity', 1);

              selectAll('.role-dots').each((d,i) => {
                  if (i == 0) console.log('d is: ', d);
                  //if (d.actor = )
              });
              const blankAnnotations = [
                  {
                      type: annotation.annotationLabel,
                      note: {
                          label: ' ',
                          title: ' ',
                          wrap: 0
                      },
                  }
              ];

              makeAnnotations.annotations(blankAnnotations);

              select('.annotation-group')
                .call(makeAnnotations);

          }],
          [function(directionForward) {
              //const slideDistance = scaleX(minAge) - scaleX(18);
              const mainContent = select('#main-content');
              mainContent.style('opacity', 0);

              mainContent.html(`<h2>Gender-bending comes back with full force in the new millenium</h2><p>If you’re an actress worried about the lack of stage opportunities after a certain age, don’t despair.
                  A hopeful trend has recently emerged. Dissatisfied with the modern status quo, a number of prominent actresses have started taking on traditionally older male roles like <span class="kingLear-color">Lear</span> and <span class="prospero-color">Prospero</span>.
                  Crossdressing is nothing new for Shakespearean productions: back when they were first performed, the <a href="https://www.thirteen.org/program-content/gender-swaps-in-shakespeare-plays/" target="_blank">female roles were played by boys</a>,
                  and throughout the 1800 and 1900s, a <a href="https://www.theguardian.com/stage/gallery/2014/sep/26/female-hamlets-sarah-bernhardt-maxine-peake-in-pictures" target="_blank">number of actresses crossdressed</a> to play <span class="hamlet-color">Hamlet</span> on stage.</p>`);
              const height = +document.querySelector('#main-content').getBoundingClientRect().height;
              const bottomOfSVGContainer = +document.querySelector('.svg-main').getBoundingClientRect().bottom;
              console.log(document.querySelector('body').getBoundingClientRect());
              mainContent.style('top', (window.innerHeight - bottomOfSVGContainer - height)/2 + bottomOfSVGContainer - 15);
              mainContent.transition(1000).style('opacity', 1);

              //transitions([1980, 2019], false, false);



              selectAll('.role-text-dots').each(function(ele) {
                  const roleTransition = select(this).transition().duration(1000).attr('opacity', 1);
                  if (ele.actor == 'Martha Henry' && ele.role == 'prospero') {
                      roleTransition.on('start', () => locked = true).on('end', () => {
                          locked = false;

                          const annotationMeta = [
                              {
                                  type: 'genderBend',
                                  actorName: 'Martha Henry',
                                  character: 'prospero',
                                  text: 'Martha Henry played Prospero in at the Stratford Festival in 2018 at the age of 80',
                                  points: [[2, -45]],
                                  dx: -20,
                                  dy: -165,
                                  align: 'middle'
                              },
                              {
                                  type: 'genderBend',
                                  actorName: 'Glenda Jackson',
                                  character: 'kingLear',
                                  text: 'After stepping down as a Labour Party MP, Glenda Jackson returned to the stage at the Old Vic as King Lear in 2016 at the age of 80',
                                  points: [[-43, -18]],
                                  dx: -125,
                                  dy: -95,
                              }
                          ];

                          createAnnotations(annotationMeta);

                          function createAnnotations(annotationsArray) {
                              const newAnnotations = [];
                              annotationsArray.forEach(annoMeta => {
                                  const index = characterAges[`${annoMeta.character}Ages`].idx;
                                  select(`.${annoMeta.character}-dots-group`).selectAll('text').each(charActor => {
                                      if (charActor.actor == annoMeta.actorName) {
                                          console.log(index, charActor.actor, charActor.age, charActor.yCoord);
                                          const charAnnotation = {
                                              type: annotation.annotationCalloutCircle,
                                              note: {
                                                  label: annoMeta.text,
                                                  wrap: 125,
                                                  align: annoMeta['align'] ? annoMeta.align : 'right'
                                              },
                                              connector: {
                                               end: 'arrow',
                                               type: 'curve',
                                                points: annoMeta.points ? annoMeta.points : null,

                                               //points: [[-40, -20]]
                                               //points: [[25, 25], [45, 22]]
                                             },
                                              x: scaleX(charActor.age),
                                             y: male(index, charActor.yCoord),
                                             dx: annoMeta.dx,
                                             dy: annoMeta.dy,
                                              subject: {radius: 23}
                                          }
                                          newAnnotations.push(charAnnotation);
                                      }

                                  });
                              });
                              makeAnnotations.annotations(newAnnotations);

                              select('.annotation-group')
                                .call(makeAnnotations);
                              selectAll('.annotation-note-label').attr('fill', 'white');//.attr('stroke', 'white');

                                selectAll('.annotation-connector path.connector')
                                  .attr('stroke', '#b4b8c0')
                                  .attr('stroke-width', '2px')
                                  .attr('stroke-dasharray', '2 2');

                                selectAll('.annotation-connector path.connector-end')
                                  .attr('fill', '#b4b8c0')
                                  .attr('stroke', 'white');

                                const rect = selectAll('.annotation-note-bg');
                                rect.attr('fill-opacity', 1)
                                    .attr('fill', '#1a1b1e')
                                selectAll('.subject').attr('stroke-dasharray', '2 1').attr('stroke', 'white');

                                selectAll('.note-line').remove();

                          }


                      });


                  }
              });
                  /**
                  const blankAnnotations = [
                      {
                          type: annotation.annotationLabel,
                          note: {
                              label: '',
                          },


                      }
                  ];

                  makeAnnotations.annotations(blankAnnotations);

                  select('.annotation-group')
                    .call(makeAnnotations);

                  //create voronoi overlay as Test
                  //voronoifiedPoints
                  //.attr('cx', d => scaleX(d.age))
                  //.attr('cy', d => roleData.gender == 'male' ? male(roleData.index, d.yCoord) : female(roleData.index, d.yCoord))
                  **/



              function translateUp() {
                  //select('.svg-main').transition().duration(2100).attr('transform', `translate(0,-${band * 9})`);
                  if (isSafari) {
                      select('.svg-main').transition().duration(1500).style('transform', `translate(0px,-${band * 9}px)`);
                  } else {
                      select('.svg-main').transition().duration(1500).attr('transform', `translate(0,-${band * 9})`);
                  }

                  //selectAll('.role-dots-group').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                  //selectAll('.character-meta-inner').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                  //selectAll('.character-label-initial').attr('stroke', 'rgb(255,255,255)');
                  //selectAll('.axis').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
              }
              //translateUp();
              //select('.svg-main').attr('transform', `translate(0,-${band * 9})`);
              //select('.voronoi-overlay').remove();

          }],
          [function() {
              //DO NOT DELETE
              select('#tooltip')
                .style('opacity', 0);

              select('#main-content')
                .html(null);


              //const slideDistance = scaleX(minAge) - scaleX(18);
              function translateDown() {
                  if (isSafari) {
                      select('.svg-main').transition().duration(1500).style('transform', `translate(0px,${band * 9 + 20}px)`);
                  } else {
                      select('.svg-main').transition().duration(1500).attr('transform', `translate(0,${band * 9 + 20})`);
                  }
                  //selectAll('.role-dots-group').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                  //selectAll('.character-meta-inner').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
                  //selectAll('.character-label-initial').attr('stroke', 'rgb(255,255,255)');
                  //selectAll('.axis').transition().duration(2100).attr('transform', `translate(-${slideDistance},0)`);
              }
              translateDown();

              select('.voronoi-overlay').remove();

              //disable brush
              brushGroup.call(brush.move, null);
              select('.svg-controls').attr('opacity', 0);
              select('.overlay').style('pointer-events', 'none');
              select('.brush').style('pointer-events', 'none');


          }],
          [function(directionForward) {
              //const transitionSlide = transition().duration(2100).on('end', () => transitions([1900, 2019], true));
              //select('.svg-main').transition(transitionSlide).attr('transform', `translate(0,0)`);
              if (isSafari) {
                  select('.svg-main').transition().duration(1500).style('transform', `translate(0,0)`);
              } else {
                  select('.svg-main').transition().duration(1500).attr('transform', `translate(0,0)`);
              }

              transitions([1900, 2019], true, false, true, true);


              //activate brush

              select('.svg-controls').attr('opacity', 1);
              select('.selection').attr('opacity', 1).attr('stroke-opacity', 0);
              select('.brush').style('pointer-events', 'all');
              select('.overlay').style('pointer-events', 'all');
              brushGroup.call(brush.move, [1900, 2018].map(scaleYear));
              selectAll('.handle').attr('fill', '#33739b');


              const mainContent = select('#main-content');
              mainContent.html(`<div class="chart-legend"><h2>A Sample of Shakespearean Productions Between <br><span class="chart-title-year-range">1900 and 2018</span></h2>
              <section><svg width='13' height='13' class='inline-svg'><pattern id="stripe-2" patternUnits="userSpaceOnUse" width="4" height="4"><path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2"/></pattern>
              <mask id="mask-2"><rect height="100%" width="100%" style="fill: url(#stripe)" /></mask>
              <circle cx='6' cy='7' r='6'/></svg><span> Actor of Color</span></section>
              <p><span class="legend-symbol">\u2642</span><span> Male Actor Playing Female Role</span></p><p><span class="legend-symbol">\u2640</span><span> Female Actor Playing Male Role</span></p>
              <section><span>Click and Drag handles on </span><img height='22px' style="vertical-align: middle;" src='assets/images/filter.png' /><span> to filter productions by year range</span></section></div>`);

              select('.inline-svg circle').attr('mask', 'url(#mask-2)').attr('fill', 'white');

              const left = (+document.querySelector('.svg-main').getBoundingClientRect().left) + (+scaleX(66)) + 30;
              const top = +document.querySelector('.svg-controls').getBoundingClientRect().bottom;

              mainContent.style('width', '362px').style('left', left).style('top', top);//.style('right', 40);

              select('.svg-main').style('opacity', 1);



          }],
          [() => {
              select('#tooltip')
                .style('opacity', 0);

              select('.svg-main').style('opacity', 0);

              select('.voronoi-overlay').remove();

              //disable brush
              brushGroup.call(brush.move, null);
              select('.svg-controls').attr('opacity', 0);
              select('.overlay').style('pointer-events', 'none');
              select('.brush').style('pointer-events', 'none');

              const left = +document.querySelector('.svg-main').getBoundingClientRect().left;
              const right = +document.querySelector('.svg-main').getBoundingClientRect().right;
              let mainContent = select('#main-content');
              mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);

              mainContent.html(`<h2 class='methodology'>Notes, Sources, & Methodology</h2>

              <p class='legend-text methodology'>Data for this project is a work in progress. The bulk of production data was collected from <a href=https://theatricalia.com/ target="_blank">Theatricalia</a> (for productions in the UK),
              and the <a href="https://www.ibdb.com/" target="_blank">Internet Broadway Database</a> and the <a href="http://www.lortel.org/Archives" target="_blank">Lortel Archives</a> for Broadway and Off-Broadway productions.
              Various other productions were collected from "Past Production" sections of various theatrical companies such as the <a href="https://www.sfstl.com/in-the-park/" target="_blank">Shakespeare Festival St. Louis</a>,
              <a href="http://www.shakespearesglobe.com/discovery-space/previous-productions" target="_blank">Shakespeare's Globe</a>, and <a href="http://www.shakespearetheatre.org/about/history-and-awards/past-production/" target="_blank">the Shakespeare Theatre Company</a>
              among many others. Sites with production data in a consistently-formatted manner were scraped using a Python script and the help of <a href="https://www.crummy.com/software/BeautifulSoup/" target="_blank">Beautiful Soup</a> among other Python packages.
              The remaining production data was manually collected. Additional production data and corrections to existing data may be added to this project at any time.</p>

              <p class='legend-text methodology'>Actor ages were calculated based on the opening date of each production and the actors' birthdays. Birthdays were primarily collected from Wikipedia and IMDb (if the actor has a page or profile on either/both). For actors that only have a public birth year, we
              used July 1 of that year as an estimate. Additionally, the following method was used to estimate the age of actors without a publically available or verifiable birth date:</p>

              <p class='legend-text methodology'>If a profile or article featuring an actor/actress is available, and an age is mentioned in the article, we took the publication date, subtracted the age in years, and then subtracted an additional 6 months, and take the 1st of that month as the actor's estimated birthday.
              As an example, if we had an article published on September 5, 2018 that mentioned a certain actor is currently 29, the estimated birthday of that actor would be March 1, 1989. For some actors, we have knowledge of a graduating year for a bachelor's degree. Barring any additional information,
              we would subtract either 21 or 22 years (some BA degrees in the UK are 3 years in length), and set the birthday to January 1st of that year. So we'd estimate the birthday of an actor who graduated from a 4-year BA program in 2018 as January 1, 1996. We understand that this approach might cause
              some errors in our dataset, since not everyone graduates on time, or starts a BA program immediately at 18.</p>

              <p class='legend-text methodology'>Actor ethnicities were determined based on categories on their Wikipedia page (e.g., "Black British male actors"), acknowledgement of a certain ethnic background in a feature or interview, a certain surname, or based on their physical appearance in photos.
              We acknowledge that some of these approaches may be prone to human error. Please reach out to me on Twitter if you’d like to submit a data correction.</p>

              <p class='legend-text methodology'>Design, code, and prose by <a href="https://twitter.com/ericwilliamlin/" target="_blank">Eric William Lin</a>. Python and D3 were used extensively throughout the entire course of the project. Additional acknowledgements and <3 to <a href='https://momentjs.com/' target='_blank'>Moment.js</a>, Susie Lu's
              <a href="http://d3-annotation.susielu.com/" target="_blank">d3-annotation</a>, <a href="https://github.com/alexhornbake" target="_blank">Alex Hornbake</a> (I owe you a beer at some point for your svg curly braces code), and Aliza Aufrichtig’s awesome tool
              <a href="https://spotify.github.io/coordinator/" target="_blank">coördinator</a>. Data for productions + metadata of actors (i.e., birthdays) can be found <a href='https://github.com/ewlin/shakespeare_production_data/tree/master/data' target='_blank'>here</a>.</p>

              <div><iframe src="https://www.facebook.com/plugins/share_button.php?href=https%3A%2F%2Fericwilliamlin.com%2Fshakespeare_production_data&layout=button_count&size=large&mobile_iframe=false&width=84&height=28&appId" width="84" height="28" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowTransparency="true" allow="encrypted-media"></iframe></div>`);
              const height = +document.querySelector('#main-content').getBoundingClientRect().height;
              mainContent.style('top', window.innerHeight/2 - height/2);


          }]
        ];
        //select('body').on('dblclick', eventsQueue[2][0]);
        //console.log(animateDots(30))
        //let animate30 = animateDots(30);
        //select('.transitions').on('click', transitions);
        //select('.dots').on('click', function nextStep() {
        //    //console.log(this);
        //    select(this).node().innerHTML = eventsQueue.length - 1 == state ? select(this).node().innerHTML : eventsQueue[state][1];
        //    if (eventsQueue[state]) {
        //        eventsQueue[state][0]();
        //    }
        //    if (state < eventsQueue.length - 1) {
        //        state += 1;
        //        select(this).on('click', nextStep);
        //    } else {
        //        select(this).on('click', () => {});
        //        select(this).attr('disabled', true);
        //    }
        //    console.log(state);
        //});
        function loadTitlesSlide () {
            animateStop = false;
            const left = +document.querySelector('.svg-main').getBoundingClientRect().left;
            const right = +document.querySelector('.svg-main').getBoundingClientRect().right;
            let windowHeight = window.innerHeight;
            let mainContent = select('#main-content');
            mainContent.style('position', 'fixed').style('left', left + 'px').style('width', right - left);
            //mainContent.html(`<p>How to navigate this story: Let’s get acquainted with how to navigate through this article. CLICK anywhere to get started. To progress through the story, use the <span class='key-indicator'>&#x21e8;</span> key or <span class='key-indicator'>&nbsp;SPACE&nbsp;</span> bar on your keyboard, and <span class='key-indicator'>&#x21e6;</span> to go back. Alternatively, you can also click on the right or left sides of the page to navigate.</p><svg class="embedded-svg" width=${right-left} height=300></svg>`);

            mainContent.html(`<svg class="embedded-svg shakespeare-dots" width=${right-left} height=${windowHeight}></svg><header class='titles-card'><a class="logo" href="/"><img src='assets/images/new-graph.png' /><span>I'M YOUR DATA HOMER</span></a><div class='titles'><h1 class="title">Casting Shakespeare</h1><p class='subtitles'><em>How age, gender, and race affect casting. A deep dive into data from 1,000+ productions of 10 Shakespearean plays between 1900 and 2018</em></p><p class='byline'><span>DESIGN</span>, <span>CODE</span>, &#38; <span>PROSE</span> by <span class="name"><a href="https://twitter.com/ericwilliamlin" target="_blank">Eric William Lin</a></span><img src='assets/images/author.png'/></p><p class="pub-date">September 2018</p></div></header><div class='instructions'><p>Press the <span class='key-indicator'>&nbsp;SPACE&nbsp;</span> bar or <span class='key-indicator'>&#x21e8;</span> to start reading the story.</p><p>Otherwise, <span class='cta exploreDataSkip'>CLICK HERE</span> to jump right to exploring the data yourself.</p></div>`);
            select('.titles-card').style('position', 'absolute').style('top', 0).style('width', right - left);
            const height = +document.querySelector('#main-content').getBoundingClientRect().height;
            let test = window.innerHeight/2 - height;
            //console.log(test);
            mainContent.style('top', window.innerHeight/2 - height/2);
            animateShakespeare(shakespeareOutline);

            //console.log('max and min')
            //console.log(max(shakespeareOutline, d => parseInt(d.y)), min(shakespeareOutline, d => parseInt(d.y)))
            function animateShakespeare(data) {

              let svg = select('.shakespeare-dots');
              const colors = Object.keys(characterAges).map(char => characterAges[char].color);
              const colorsLength = colors.length;
              const maxY = max(shakespeareOutline, d => parseInt(d.y));
              const minY = min(shakespeareOutline, d => parseInt(d.y));
              const maxX = max(shakespeareOutline, d => parseInt(d.x));
              const minX = min(shakespeareOutline, d => parseInt(d.x));

              const shakespeareFigureHeight = maxY - minY;
              const shakespeareFigureWidth = maxX - minX;

              const top = (windowHeight - shakespeareFigureHeight)/2;
              const shiftRight = (right - left - shakespeareFigureWidth)/2;


              svg.selectAll('dots').data(data).enter()
                .append('circle')
                .attr('r', '4px')
                .attr('cx', d => parseInt(d.x) + shiftRight - minX)
                .attr('cy', d => parseInt(d.y) + top)
                .attr('fill', () => colors[Math.floor(Math.random() * colorsLength)])
                .attr('fill-opacity', .4);


              let t = interval(function(elapsed) {
                svg.selectAll('circle').transition().duration(400)
                  .attr('r', () => (Math.random() * 3 + 5) + 'px')
                  .attr('fill', () => colors[Math.floor(Math.random() * colorsLength)])
                  .attr('fill-opacity', d => Math.random());
                if (animateStop == true) t.stop();
                //console.log(elapsed);
              }, 500);
            }
        }
        const queueLength = eventsQueue.length;


        let progressBarScale = scaleLinear().domain([0, queueLength]).range([0, windowWidth]);
        //console.log('hello', widthMax, queueLength, progressBarScale(4));
        loadTitlesSlide();

        function updateProgressBar() {
            if (state >= 1) {
              console.log(progressBarScale(state));
              if (!document.querySelector('.progress-bar-svg')) {
                select('body').append('svg').attr('class', 'progress-bar-svg').attr('height', '8px').attr('width', windowWidth)
                  .append('g').classed('progress-bar-container', true)
                  .append('rect').attr('x', 0).attr('y', 0).attr('height', '8px').attr('width', windowWidth)
                  .attr('fill', 'grey').attr('opacity', .4);

                  /**
                select('.svg-controls').append('g').classed('progress-bar-container', true)
                  .append('rect').attr('x', 0).attr('y', 0).attr('height', '8px').attr('width', widthMax)
                  .attr('fill', 'grey').attr('opacity', .4);
                   **/
                select('.progress-bar-container').append('rect').classed('progress-bar', true).attr('x', 0).attr('y', 0)
                  .attr('height', '8px')
                  .attr('width', () => progressBarScale(state))
                  //.attr('width', 100)
                  .attr('fill', '#33739b');
                //#33739b
              } else {
                  select('.progress-bar').attr('width', () => progressBarScale(state));
              }

          } else {
              const progressBar = document.querySelector('.progress-bar-svg');
              progressBar.parentNode.removeChild(progressBar);
          }
        }
        document.addEventListener('keydown', function nextStep (e) {
          //e.preventDefault();
            if (!locked) {
              console.log('keypressed: ' + e.code);
              if (e.code === 'ArrowRight' || e.code === 'Space') {
                if (eventsQueue[state]) {
                  eventsQueue[state][0](true, state);
                }

                if (state < eventsQueue.length) {
                  state += 1;
                  //select(this).on('click', nextStep);
                  document.addEventListener('keydown', nextStep);
                  updateProgressBar();
                } else {
                  document.addEventListener('keydown', () => {});
                }
                console.log(state);

              } else if (e.code === 'ArrowLeft') {
                if (state > 1) {
                  eventsQueue[state - 2][0](false, state);
                } else {
                  loadTitlesSlide();
                }
                if (state > 0) {
                  state -= 1;
                  updateProgressBar();
                }

              }
          }

        });

        document.querySelector('body').addEventListener('mousedown', function nextStep (e) {
          if (e.target.tagName == 'A') {
              return;
          } else if (e.target.classList.contains('cta')) {
              //e.stopPropagation();
              console.log('this is the button');

              if (e.target.classList.contains('exploreDataSkip')) skipToExplore();
              if (e.target.classList.contains('story-skip')) {
                  eventsQueue[2][0](false);
              }
              return;
          }
          if (!locked) {
              const windowWidth = window.innerWidth;

              if (e.clientX > windowWidth/2) {
                if (eventsQueue[state]) {
                  eventsQueue[state][0](true, state);
                }

                if (state < eventsQueue.length) {
                  state += 1;
                  //select(this).on('click', nextStep);
                  document.querySelector('body').addEventListener('mousedown', nextStep);
                  updateProgressBar();

                } else {
                  document.querySelector('body').addEventListener('mousedown', () => {});
                }
                console.log(state);
              } else {
                if (state > 1) {
                  eventsQueue[state - 2][0](false, state);
                } else {
                  loadTitlesSlide();
                }
                if (state > 0) {
                  state -= 1;
                  updateProgressBar();
                }

              }
          }


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
                        //const voronoiActive = select('.voronoi-overlay').selectAll('path').filter(d => {
                        //    return moment(d.data.actor.opening) >= moment(String(dateRange[0])) && moment(d.data.actor.opening) < moment(String(dateRange[1] + 1));
                        //});

                        select('.voronoi-overlay').selectAll('path').attr('pointer-events', d => {
                            return moment(d.data.actor.opening) >= moment(String(dateRange[0])) && moment(d.data.actor.opening) < moment(String(dateRange[1] + 1))
                                ? 'all'
                                : 'none';
                        });


						const filteredDots = selectAll('.role-dots').filter(d => {
							return moment(d.opening) >= moment(String(dateRange[0])) && moment(d.opening) < moment(String(dateRange[1] + 1));
						});

                        //TODO: Try applying mask on oppoGender data points as well (8/24)

						console.log(filteredDots)

						selectAll('.role-dots')
							.attr('fill-opacity', d => {
								return moment(d.opening) >= moment(String(dateRange[0])) && moment(d.opening) < moment(String(dateRange[1] + 1))
									? (d.race != 'unknown' && d.race != 'none' ? .9 : .6)
									: .05;
							})
							.attr('stroke', d => {
								if (moment(d.opening) >= moment(String(dateRange[0])) && moment(d.opening) < moment(String(dateRange[1] + 1))) return 'none';
							});

                        selectAll('.role-text-dots')
    						.attr('fill-opacity', d => {
    							return moment(d.opening) >= moment(String(dateRange[0])) && moment(d.opening) < moment(String(dateRange[1] + 1))
    								? 1
                                    : .05;
    						});
    						//.attr('stroke', d => {
    						//	if (moment(d.opening) >= moment(String(dateRange[0])) && moment(d.opening) < moment(String(dateRange[1] + 1))) return 'none';
    						//});

						const othelloPOCDots = filteredDots.filter(dot => dot.race != 'unknown' && dot.race != 'none' && dot.role == 'othello')._groups[0].length;
						const othelloDots = filteredDots.filter(dot => dot.role == 'othello')._groups[0].length;

						console.log(othelloPOCDots + ', ' + othelloDots);

                        /**


						filteredDots.filter(dot => {
							let actor_gender = dot.actorGender;
							if (characterAges[dot.role + 'Ages'].gender == 'male' && actor_gender == 'female') {
								return true;
							} else if (characterAges[dot.role + 'Ages'].gender == 'female' && actor_gender == 'male') {
								return true;
							} else {
								return false;
							}
						})
						.attr('r', '7px')
						.attr('stroke', 'white')
						.attr('stroke-width', '2px')
						.attr('stroke-opacity', 1);
                        **/
					}

				}



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



	});
