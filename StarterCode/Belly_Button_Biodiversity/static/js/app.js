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
  sample = await d3.json(`/samples/${sample}`)
  // @TODO: Build a Bubble Chart using the sample data
  // @TODO: Build a Pie Chart
  // create an array of objects for easier sorting
  let sampleList = []

  for (i=0; i<sample.sample_values.length; i++) {
    sampleObject = {
      "otu_ids": sample.otu_ids[i],
      "otu_labels": sample.otu_labels[i],
      "sample_values": sample.sample_values[i]
    }
    sampleList.push(sampleObject)
  }
  // TODO: figure out how this list is printed sorted before the sort is called!
  // console.log(sampleList)
  sampleList = sampleList.sort(function(a,b) {
    return b.sample_values - a.sample_values
  })

  plotSampleData = sampleList.slice(0, 10)
  console.log(plotSampleData)
  otu_ids =  unpack(plotSampleData, "otu_ids")
  otu_labels = unpack(plotSampleData, "otu_labels")
  sample_values =  unpack(plotSampleData, "sample_values")
  console.log(otu_labels)
  // console.log(sampleList)
  const trace1 = {
    "values": sample_values,
    "labels": otu_ids,
    "type": "pie",
    // "text": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    // "text": otu_labels
  }
  data1 = [trace1]
  Plotly.newPlot("pie", data1);
  const trace2 = {
    x: otu_ids,
    y: sample_values,
    mode: 'markers',
    marker: {
      size: sample_values
    }
    // text: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    // hoverinfo = 'text'
  }

  // TODO: why doesn't `${sample}` work for the graph title
  const layout2 = {
    title: "My title",
    xaxis: {
      title: {
        text: 'OTU ID',
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
