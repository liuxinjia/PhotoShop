function renameLayerNames() {
  return window.require("photoshop").core.executeAsModal(
    () => {
      // now, we have write-access

      app.activeDocument.layers.forEach((layer) => {
        // Regular Expression that searches for the layer's name
        // without a previously appended layer opacity.
        // Cf. https://regex101.com/r/iWF1Yw/1
        const regExp = /^(.*?)( \(\d+ %\))?$/;
        const baseName = layer.name.match(regExp)[1];
        layer.name = `${baseName} (${layer.opacity} %)`;
      });

    },
    {
      commandName: "Rename layers",
    }
  );
}

async function exportReport() {
  // create the TSV string
  let tsvString = "Base name\tOpacity\tIs visible";

  app.activeDocument.layers.forEach((layer) => {
    tsvString +=
      "\n" +
      layer.name +
      "\t" +
      layer.opacity +
      "\t" +
      (layer.visible ? "yes" : "no");
  });

  // save the string to the filesystem
  const storage = window.require("uxp").storage;
  const file = await storage.localFileSystem.getFileForSaving("layers.csv");
  await file.write(tsvString);
}

async function changeSelectName() {
  await window.require("photoshop").core.executeAsModal(resetSelectLayersStatus, { "commandName": "User Cancel Test" });
}

async function resetSelectLayersStatus(executionContext) {

  await app.activeDocument.activeLayers.forEach((layer) => {

    layerName = layer.name;
    if (document.getElementById("layerName").value != ""
      && app.activeDocument.activeLayers.length == 1
    ) {
      layerName = document.getElementById("layerName").value;
    }

    const match = layerName.match(beforeBracketRegex);
    if (match) {
      layerName = match[0];
      console.log(layerName); // Output: "world"
    } else {
      console.log("No match found");
      return
    }

    var params = ""

    if (app.activeDocument.activeLayers.length == 1) {
      if (imgName != "") {
        params = `img:${imgName}|`;
      }
    } else {
      var oldimgName = layer.name.match(imgAfterRegex)[0];
      params = `${oldimgName}|`;
    }

    if (isSlice) {
      params += "slice:0|";
    }
    if (isFullScreen) {
      params += "fullScreen:0|";
    }
    layer.name = `${layerName}[${params}]`;
  });

}

const beforeBracketRegex = /^[^\[]+/;
const imgAfterRegex = /img:(\w+)/
const sliceAfterRegex = /slice:(\w+)/
const fulScreenAfterRegex = /slice:(\w+)/
const app = window.require("photoshop").app;

var layerName = ""
var imgName = ""
var isSlice = false
var isFullScreen = false

document.getElementById("btnExport").addEventListener("click", exportReport);

document
  .getElementById("btnRename")
  .addEventListener("click", renameLayerNames);

document.getElementById("layerName").addEventListener("input", evt => {
  changeSelectName();
  console.log(`New value: ${evt.target.value}`);
});

document.getElementById("imgName").addEventListener("input", evt => {
  imgName = evt.target.value
  changeSelectName();
  console.log(`New value: ${evt.target.value}`);
})

document.getElementById("fullscreen").addEventListener("change", evt => {
  console.log(`Is the checkbox checked: ${evt.target.checked}`);
  isFullScreen = evt.target.checked
  changeSelectName();
})

document.getElementById("slice").addEventListener("change", evt => {
  console.log(`Is the checkbox checked: ${evt.target.checked}`);
  isSlice = evt.target.checked
  changeSelectName();
})
