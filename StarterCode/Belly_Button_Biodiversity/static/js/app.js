async function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

    // Use d3 to select the panel with id of `#sample-metadata`
    const thisMetadata = await d3.json(`/metadata/${sample}`)
    const metadataPanel = d3.select ("#sample-metadata")

    // Use `.html("") to clear any existing metadata
    metadataPanel.html("")

    // TODO: refactor to use object.entries
    // Use `Object.entries` to add each key and value pair to the panel
    for (key in thisMetadata) {
      currentElement = metadataPanel.append(`${key}`)
      currentElement.html(`${key}: ${thisMetadata[key]}<br>`)
    }

    // htmlString = ""

    // for (key in thisMetadata) {
    //   htmlString += `${key}: ${thisMetadata[key]} <br>`
    // }


    // metadataPanel.html(htmlString)

    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.


    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
    buildGauge(thisMetadata["WFREQ"])
}

function buildGauge(level){
  const gauge = d3.select ("#gauge")
  // Enter a speed between 0 and 180
  var newLevel = level*180/8-10;

  // Trig to calc meter point
  var degrees = 115, radius = .6;
  var radians = degrees * Math.PI / 180;
  var x = -1 * radius * Math.cos(radians);
  var y = radius * Math.sin(radians);

  var degrees = 180 - newLevel,
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
      name: 'speed',
      text: level,
      hoverinfo: 'text+name'},
    { values: [ 50/8, 50/8, 50/8, 50/8, 50/8, 50/8, 50/8, 50/8, 50],
    rotation: 90,
    text: ['>7', '7', '6', '5', '4',
              '3', '2', '1'],
    textinfo: 'text',
    textposition:'inside',
    marker: {colors:['rgba(0, 80, 0, .5)', 'rgba(4, 107, 0, .5)', 'rgba(24, 137, 10, .5)', 'rgba(120, 164, 32, .5)',
                           'rgba(180, 212, 52, .5)', 'rgba(212, 219, 105, .5)',
                           'rgba(220, 216, 155, .5)', 'rgba(242, 236, 212, .5)',
                           'rgba(255, 255, 255, 0)', 'rgba(265, 265, 265, 0)', 'white']},
    labels: ['151-180', '121-150', '91-120', '61-90', '31-60', '0-30', ''],
    hoverinfo: 'label',
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
    height: 600,
    width: 600,
    xaxis: {zeroline:false, showticklabels:false,
               showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
               showgrid: false, range: [-1, 1]}
  };

  Plotly.newPlot('gauge', data, layout);
}

function unpack(rows, index) {
    return rows.map(function(row) {
        return row[index];
    });
}

async function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
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
  sampleList = sampleList.sort(function(a,b) {
    return b.sample_values - a.sample_values
  })

  plotSampleData = sampleList.slice(0, 10)
  otu_ids =  unpack(sampleList, "otu_ids")
  otu_labels = unpack(sampleList, "otu_labels")
  sample_values = unpack(sampleList, "sample_values")

  const trace1 = {
    values: sample_values.slice(0,10),
    labels: otu_ids.slice(0,10),
    names: otu_labels.slice(0,10),
    type: "pie",
    mode: 'markers',
    hovertext: otu_labels.slice(0,10),
    hoverinfo: 'label+percent+text',
  }
  // display the pie chart
  data1 = [trace1]
  Plotly.newPlot("pie", data1);

  // create bubble chart
  const trace2 = {
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
  const layout2 = {
    title: `Sample #${sample}`,
    xaxis: {
      title: {
        text: 'OTU ID'
      }
    },
    height: 800,
    width: 1600
  }

  data2 = [trace2]
  // display the bubble chart
  Plotly.newPlot("bubble", data2, layout2)
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
