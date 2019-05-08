async function buildMetadata(sample) {
    // Use d3 to select the panel with id of `#sample-metadata`
    const thisMetadata = await d3.json(`/metadata/${sample}`)
    const metadataPanel = d3.select ("#sample-metadata")

    // clear metadata panel
    metadataPanel.html("")

    for (key in thisMetadata) {
      currentElement = metadataPanel.append(`${key}`)
      currentElement.html(`${key}: ${thisMetadata[key]}<br>`)
    }
    const washFrequency = thisMetadata["WFREQ"]
    buildGauge(washFrequency)
}

function unpack(rows, index) {
    return rows.map(function(row) {
        return row[index];
    });
}

function buildBubble (data, sample) {

  otu_ids =  unpack(data, "otu_ids")
  otu_labels = unpack(data, "otu_labels")
  sample_values = unpack(data, "sample_values")

  const trace = {
    x: otu_ids,
    y: sample_values,
    mode: 'markers',
    marker: {
      size: sample_values,
      color: otu_ids,
      colorscale: "Earth"
    },
    text: otu_labels
  }
  const layout= {
    title: `Sample #${sample}`,
    xaxis: {
      title: {
        text: 'OTU ID'
      }
    },
    // height: 800,
    // width: 1600
  }

  data = [trace]
  // display the bubble chart
  Plotly.newPlot("bubble", data, layout)
}

function buildPie (data) {
  otu_ids =  unpack(data, "otu_ids")
  otu_labels = unpack(data, "otu_labels")
  sample_values = unpack(data, "sample_values")

  const trace = {
    values: sample_values,
    labels: otu_ids,
    names: otu_labels,
    type: "pie",
    mode: 'markers',
    hovertext: otu_labels,
    hoverinfo: 'label+percent+text',
  }
  // display the pie chart
  data = [trace]
  Plotly.newPlot("pie", data);
}

async function buildCharts(sample) {

  const thisSample = await d3.json(`/samples/${sample}`)

  // create an array of objects for easier sorting
  let sampleList = []

  for (i=0; i<thisSample.sample_values.length; i++) {
    sampleObject = {
      "otu_ids": thisSample.otu_ids[i],
      "otu_labels": thisSample.otu_labels[i],
      "sample_values": thisSample.sample_values[i]
    }
    sampleList.push(sampleObject)
  }

  // sort the array on sample_values, in descending order
  sampleList = sampleList.sort(function(a,b) {
    return b.sample_values - a.sample_values
  })

  buildPie(sampleList.slice(0,10))
  buildBubble(sampleList, sample)
}

function buildGauge(level){
  const gauge = d3.select ("#gauge")
  var newLevel = level*180/9;

  // Trig to calc meter point
  var degrees = 115, radius = .6;
  var radians = degrees * Math.PI / 180;
  var x = -1 * radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  var degrees = 180 - newLevel+5,
       radius = .5;
  var radians = degrees * Math.PI / 180;
  var x = radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  // Path: may have to change to create a better triangle
  var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
       pathX = String(x),
       space = ' ',
       pathY = String(y),
       pathEnd = ' Z';
  var path = mainPath.concat(pathX,space,pathY,pathEnd);

  var data = [{ type: 'scatter',
     x: [0], y:[0],
      marker: {size: 28, color:'850000'},
      showlegend: false,
      name: 'frequency',
      text: level,
      hoverinfo: 'name'},
    { values: [ 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
    rotation: 90,
    text: ['9', '8', '7', '6', '5', '4',
              '3', '2', '1'],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgba(1, 83, 1, .90  )', 'rgba(1, 83, 1, 0.80)', 'rgba(1, 83, 1, 0.70)',
                          'rgba(1, 83, 1, 0.60)',
                           'rgba(1, 83, 1, 0.50)', 'rgba(1, 83, 1, 0.40)',
                           'rgba(1, 83, 1, 0.30)', 'rgba(1, 83, 1, 0.20)', 'rgba(1, 83, 1, 0.10)',
                            'white']},
    // labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
    hoverinfo: 'text',
    hole: .5,
    type: 'pie',
    showlegend: false
  }];

  var layout = {
    shapes:[{
        type: 'path',
        path: path,
        fillcolor: '850000',
        line: {
          color: '850000'
        }
      }],
    title: '<b>Gauge</b> <br> Washing Frequency',
    // height: 600,
    // width: 600,
    xaxis: {zeroline:false, showticklabels:false,
               showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
               showgrid: false, range: [-1, 1]}
  };

  Plotly.newPlot('gauge', data, layout);
}



function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}


function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
