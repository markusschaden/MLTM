var mltms = new Array();

function MLTM(tag) {
  this.tag = tag;

  this.selectedNodes = new Array();

  var maxsize;
  this.__defineGetter__("maxsize", function() { return maxsize; });
  this.__defineSetter__("maxsize", function(value) {
    if (value > 0) {
      maxsize = value;
      recalcValues();
    }
  });

  var proportion;
  this.__defineGetter__("proportion", function() { return proportion; });
  this.__defineSetter__("proportion", function(value) {
    if (value <= 1 && value > 0) {
      proportion = value;
      recalcValues();
    }
  });

  var limit;
  this.__defineGetter__("limit", function() { return limit; });
  this.__defineSetter__("limit", function(value) {
      if (value >= 0) {
        limit = value;
        recalcValues();
      }
  });

  var extraSpace;
  this.__defineGetter__("extraSpace", function() { return extraSpace; });
  this.__defineSetter__("extraSpace", function(value) {
      if (value >= 0) {
        extraSpace = value;
        recalcValues();
      }
  });

  var distances;
  this.__defineGetter__("distances", function() {
    return distances;
  });

  var innersizes;
  this.__defineGetter__("innersizes", function() {
    return innersizes;
  });

  var controlsize;
  this.__defineGetter__("controlsize", function() {
    return controlsize;
  });

  function init() {
    maxsize = 100;
    proportion = 0.80;
    limit = 3;
    extraSpace = 50;
    recalcValues();
  }

  function recalcValues() {
    innersizes = [maxsize+extraSpace];
    controlsize = 0;
    for (var i = 0; i < limit; i++) {
      controlsize += Math.pow(2,i)*innersizes[i];
      innersizes.push(innersizes[i]*proportion);
    }

    distances = new Array();
    for (var i = 0; i < limit-1; i++)
      distances.push((((i > 0) ? 2*distances[i-1]-innersizes[i-1] : controlsize)-innersizes[i])/4+innersizes[i]/2)

    console.log("maxsize: "+maxsize);
    console.log("proportion: "+proportion);
    console.log("limit: "+limit);
    console.log("innersizes: "+innersizes);
    console.log("controlsize: "+controlsize);
    console.log("distances: "+distances);
  }

  init();
}

function Node(tag, valueTag, mltm, sub) {
  this.tag = tag;
  this.valueTag = valueTag;
  this.mltm = mltm;
  this.sub = sub;
  this.sel = sub;
  this.collapsed = false;
  this.x = 0;
  this.y = 0;
}

function calcSizeBySelection(node) {
  return Math.pow(node.mltm.proportion,node.sel);
}

function updateSelectedNode(index, mltm) {
  var node = mltm.selectedNodes[0];
  if (!node) node = $(mltm.tag.children("[node]")[0]).data("node");
  var height = mltm.tag.height();
  var width = mltm.tag.width();
  node.x = Math.round(width/2-mltm.maxsize/2);
  node.y = Math.round(height/2-mltm.maxsize/2);
  node.valueTag.velocity({
    top: node.y+"px",
    left: node.x+"px",
  });
  var maxsize = mltm.maxsize;
  node.valueTag.velocity({
    width: maxsize+"px",
    height: maxsize+"px",
    scaleX: calcSizeBySelection(node),
    scaleY: calcSizeBySelection(node)
  }, { queue: false });
  if (node.sub >= node.mltm.limit) {
    node.valueTag.velocity("fadeOut", { queue: false });
    node.valueTag.velocity({
      scaleX: 0,
      scaleY: 0
    }, { queue: false });
  } else if (!node.valueTag.is(":visible"))
    node.valueTag.velocity("fadeIn", { queue: false });
  var nodes = node.tag.children("[node]");
  for (var i = 0; i < nodes.length; i++)
    updateNodes(i, nodes[i], nodes.length, node);
}

function updateNodes(index, tag, count, parent) {
  var node = $(tag).data("node");
  node.x = parent.x+Math.cos(((360/count)*(index+1))* Math.PI / 180.0)*node.mltm.distances[node.sub-1];
  node.y = parent.y+Math.sin(((360/count)*(index+1))* Math.PI / 180.0)*node.mltm.distances[node.sub-1];
  node.valueTag.velocity({
    top: node.y+"px",
    left: node.x+"px",
  });
  var maxsize = node.mltm.maxsize;
  node.valueTag.velocity({
    width: maxsize+"px",
    height: maxsize+"px",
    scaleX: calcSizeBySelection(node),
    scaleY: calcSizeBySelection(node)
  }, { queue: false });
  if (node.sub >= node.mltm.limit || parent.collapsed) {
    node.valueTag.velocity("fadeOut", { queue: false });
    node.valueTag.velocity({
      scaleX: 0,
      scaleY: 0
    }, { queue: false });
  } else if (!node.valueTag.is(":visible"))
    node.valueTag.velocity("fadeIn", { queue: false });

  var nodes = node.tag.children("[node]");
  for (var i = 0; i < nodes.length; i++)
    updateNodes(i, nodes[i], nodes.length, node);
}

$(document).ready(function() {
  function initMLTMs() {
      var tag = $(this);
      var mltm = new MLTM(tag);
      mltms.push(mltm);
      if (tag.data("mltm") === undefined) tag.data("mltm", mltm);
      var nodes = tag.children("[node]");
      for (var i = 0; i < nodes.length; i++)
        initNodes(nodes[i], mltm, 0);
  }

  function initNodes(object, mltm, sub) {
    var tag = $(object);
    var node = new Node(tag, $(tag.children("[nodevalue]")[0]), mltm, sub);
    tag.click({mltm: mltm, node: node}, function(event) {
      event.data.mltm.selectedNodes[0] = event.data.node;
      $.each(mltms, updateSelectedNode);
    });
    if (tag.data("node") === undefined) tag.data("node", node);
    var nodes = tag.children("[node]");
    for (var i = 0; i < nodes.length; i++)
      initNodes(nodes[i], mltm, sub+1);
  }

  $.each($.find("[mltm]"),initMLTMs);
  $.each(mltms, updateSelectedNode);
});
