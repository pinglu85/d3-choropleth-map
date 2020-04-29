const width = 960;
const height = 600;
const legendWidth = 300;
const legendHeight = 10;

const svg = d3
  .select('.choropleth-map')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

const path = d3.geoPath();

const urls = [
  // Education Data
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json',

  // Country Data
  'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json',
];

const promises = [];

urls.forEach((url) => {
  promises.push(d3.json(url));
});

Promise.all(promises)
  .then((data) => {
    const educationData = [...data[0]];
    const us = { ...data[1] };

    // Legend threshold
    const minBachelor = d3.min(educationData, (d) => d.bachelorsOrHigher);
    const maxBachelor = d3.max(educationData, (d) => d.bachelorsOrHigher);
    const legendThreshold = d3
      .scaleThreshold()
      .domain(
        d3.range(minBachelor, maxBachelor, (maxBachelor - minBachelor) / 8)
      )
      .range(d3.schemeGreens[9]);

    console.log(d3.range(2.6, 75.1, (75.1 - 2.6) / 8));
    // Legend X Scale
    const legendXScale = d3
      .scaleLinear()
      .domain([minBachelor, maxBachelor])
      .range([0, legendWidth]);

    // Legend
    const legend = svg
      .append('g')
      .attr('id', 'legend')
      .attr('transform', `translate(${width / 2 + 90}, 30)`);

    legend
      .selectAll('rect')
      .data(
        legendThreshold.range().map((color) => {
          const d = legendThreshold.invertExtent(color);
          if (!d[0]) {
            d[0] = legendXScale.domain()[0];
          }
          if (!d[1]) {
            d[1] = legendXScale.domain()[1];
          }
          return d;
        })
      )
      .enter()
      .append('rect')
      .attr('fill', (d) => legendThreshold(d[0]))
      .attr('x', (d) => legendXScale(d[0]))
      .attr('y', 0)
      .attr('width', (d) => legendXScale(d[1]) - legendXScale(d[0]))
      .attr('height', legendHeight);

    // Legend X axis
    const legendXAxis = d3
      .axisBottom(legendXScale)
      .tickValues(legendThreshold.domain())
      .tickSize(15)
      .tickFormat((x) => `${Math.round(x)} %`);

    legend.append('g').call(legendXAxis);

    legend.select('.domain').remove(); // Remove axis line

    // U.S. counties
    svg
      .append('g')
      .selectAll('path')
      .data(topojson.feature(us, us.objects.counties).features)
      .join('path')
      .attr('fill', (d) => {
        const fips = d.id;
        const eduEl = educationData.find((el) => el.fips === fips);
        return legendThreshold(eduEl.bachelorsOrHigher);
      })
      .attr('d', path);

    // U.S. states borders
    svg
      .append('path')
      .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
      .attr('fill', 'none')
      .attr('stroke', '#fff')
      .attr('stroke-linejoin', 'round')
      .attr('d', path);
  })
  .catch((err) => console.log(err));
