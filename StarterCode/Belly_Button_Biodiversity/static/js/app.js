function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
    // Use d3 to select the panel with id of `#sample-metadata`

    // Use `.html("") to clear any existing metadata

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
}

function unpack(rows, index) {
    return rows.map(function(row) {
        return row[index];
    });
}

async function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  thisSample = await d3.json(`/samples/${sample}`)
  // @TODO: Build a Bubble Chart using the sample data
  // @TODO: Build a Pie Chart
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
  // TODO: figure out how this list is printed sorted before the sort is called!
  sampleList = sampleList.sort(function(a,b) {
    return b.sample_values - a.sample_values
  })

  plotSampleData = sampleList.slice(0, 10)
  // console.log(plotSampleData)
  otu_ids =  unpack(sampleList, "otu_ids")
  otu_labels = unpack(sampleList, "otu_labels")
  sample_values =  unpack(sampleList, "sample_values")
  // console.log(otu_labels)

  const trace1 = {
    values: sample_values.slice(0,10),
    labels: otu_ids.slice(0,10),
    type: "pie",
    hoverinfo: otu_labels.slice(0,10),
    mode: 'markers'
    // "text": otu_labels,
    // hoverinfo: otu_labels
  }
  data1 = [trace1]
  Plotly.newPlot("pie", data1);

  const trace2 = {
    x: otu_ids,
    y: sample_values,
    mode: 'markers',
    marker: {
      size: sample_values,
      color: otu_ids,
      colorscale: "Earth"
    },
    // text: otu_labels,
    hoverinfo: otu_labels

  }
  const layout2 = {
    title: `Sample #${sample}`,
    xaxis: {
      title: {
        text: 'OTU ID'
      }
    }
  }

  // TODO: figure out hover text in both graphs

  data2 = [trace2]
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
