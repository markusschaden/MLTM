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
    if (value < 1 && value >= 0) {
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

  var distances;
  this.__defineGetter__("distances", function() {
    return distances;
  });

  var innersizes;
  this.__defineGetter__("innersizes", function() {
    return innersizes;
  });

  var outersizes;
  this.__defineGetter__("outersizes", function() {
    return outersizes;
  });

  function init() {
    maxsize = 100;
    proportion = 0.20;
    limit = 3;
    recalcValues();
  }

  function recalcValues() {
    innersizes = [maxsize];
    outersizes = new Array();
    for (var i = 0; i < limit; i++) {
      outersizes.push(((i > 0) ? outersizes[i-1] : 0)+Math.pow(2,i)*innersizes[i]);
      innersizes[i+1] = innersizes[i]-innersizes[i]*proportion
    }

    distances = new Array();
    for (var i = limit-1; i >= 0; i--)
      distances.push((outersizes[i]-maxsize)/4+maxsize/2);

    console.log("maxsize: "+maxsize);
    console.log("proportion: "+proportion);
    console.log("limit: "+limit);
    console.log("innersizes: "+innersizes);
    console.log("outersizes: "+outersizes);
    console.log("distances: "+distances);
  }

  function calcSize(sub) {
    return maxsize-sub*maxsize*proportion;
  }

  init();
}

function Node(tag, mltm) {
  this.tag = tag;
  this.mltm = mltm;

  this.collapsed = false;
}

function updateSelectedNode(index, mltm) {
  var node = mltm.selectedNodes[0];
  if (!node) node = $(mltm.tag.children("[node]")[0]).data("node");
  var height = mltm.tag.height();
  var width = mltm.tag.width();
  node.tag.velocity({
    top: Math.round(height/2-mltm.maxsize/2)+"px",
    left: Math.round(width/2-mltm.maxsize/2)+"px",
  });
  var maxsize = mltm.maxsize;
  node.tag.velocity({
    width: maxsize+"px",
    height: maxsize+"px",
    scaleX: 1,
    scaleY: 1
  }, { queue: false });
  var sub = 0;
  if (sub >= node.mltm.limit) {
    node.tag.velocity("fadeOut", { queue: false });
    node.tag.velocity({
      scaleX: 0,
      scaleY: 0
    }, { queue: false });
  } else if (!node.tag.is(":visible"))
    node.tag.velocity("fadeIn", { queue: false });
  var nodes = node.tag.children("[node]");
  for (var i = 0; i < nodes.length; i++)
    updateNodes(i, nodes[i], nodes.length, sub+1);
}

function updateNodes(index, tag, count, sub) {
  var node = $(tag).data("node");
  var x = Math.cos(((360/count)*(index+1))* Math.PI / 180.0)*node.mltm.distances[sub-1];
  var y = Math.sin(((360/count)*(index+1))* Math.PI / 180.0)*node.mltm.distances[sub-1];
  node.tag.velocity({
    top: y+"px",
    left: x+"px",
  });
  var maxsize = node.mltm.maxsize;
  node.tag.velocity({
    width: maxsize+"px",
    height: maxsize+"px",
    scaleX: 1-node.mltm.proportion,
    scaleY: 1-node.mltm.proportion
  }, { queue: false });
  if (sub >= node.mltm.limit) {
    node.tag.velocity("fadeOut", { queue: false });
    node.tag.velocity({
      scaleX: 0,
      scaleY: 0
    }, { queue: false });
  } else if (!node.tag.is(":visible"))
    node.tag.velocity("fadeIn", { queue: false });

  var nodes = node.tag.children("[node]");
  for (var i = 0; i < nodes.length; i++)
    updateNodes(i, nodes[i], nodes.length, sub+1);
}

$(document).ready(function() {
  function initMLTMs() {
      var tag = $(this);
      var mltm = new MLTM(tag);
      mltms.push(mltm);
      if (tag.data("mltm") === undefined) tag.data("mltm", mltm);
      var nodes = tag.children("[node]");
      for (var i = 0; i < nodes.length; i++)
        initNodes(nodes[i], mltm);
  }

  function initNodes(object, mltm) {
    var tag = $(object);
    var node = new Node(tag, mltm);
    if (tag.data("node") === undefined) tag.data("node", node);
    var nodes = tag.children("[node]");
    for (var i = 0; i < nodes.length; i++)
      initNodes(nodes[i], mltm);
  }

  $.each($.find("[mltm]"),initMLTMs);
  $.each(mltms, updateSelectedNode);
});
