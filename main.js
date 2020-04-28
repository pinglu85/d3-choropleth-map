const width = 960;
const height = 600;

const svg = d3
  .select('.choropleth-map')
  .append('svg')
  .attr('width', width)
  .attr('height', height);

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
    console.log(data);
  })
  .catch((err) => console.log(err));
