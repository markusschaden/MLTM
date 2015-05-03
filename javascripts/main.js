var mltms = new Array();

function MLTM(tag) {
  this.tag = tag;

  this.mainNode;

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

  var angle;
  this.__defineGetter__("angle", function() { return angle; });
  this.__defineSetter__("angle", function(value) {
    if (value > 0 && value <= Math.PI*2) {
      angle = value;
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

  var rotation;
  this.__defineGetter__("rotation", function() { return rotation; });
  this.__defineSetter__("rotation", function(value) { if (value >= 0 && value <= Math.PI*2) rotation = value; });

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
    angle = Math.PI*2;
    rotation = 0;
    recalcValues();
  }

  function recalcValues() {
    innersizes = [maxsize+extraSpace];
    controlsize = 0;
    for (var i = 0; i < limit; i++) {
      controlsize += innersizes[i]*((angle <= Math.PI) ? 1 : Math.pow(2,i));
      innersizes.push(innersizes[i]*proportion);
    }

    distances = new Array();
    for (var i = 0; i < limit-1; i++) {
      if (angle <= Math.PI) distances.push(innersizes[i]/2+innersizes[i+1]/2);
      else distances.push((((i > 0) ? 2*distances[i-1]-innersizes[i-1] : controlsize)-innersizes[i])/4+innersizes[i]/2)
    }

    console.log("maxsize: "+maxsize);
    console.log("proportion: "+proportion);
    console.log("limit: "+limit);
    console.log("innersizes: "+innersizes);
    console.log("controlsize: "+controlsize);
    console.log("distances: "+distances);
  }

  init();
}

function Node(tag, valueTag, mltm, sub, parent) {
  this.tag = tag;
  this.valueTag = valueTag;
  this.mltm = mltm;
  this.sub = sub;
  this.sel = sub;
  this.pNode = parent;
  this.cNodes = new Array();
  this.x = 0;
  this.y = 0;
  this.angle = 0;
}

function calcAngle(node) {
  var extra = (node.pNode.pNode) ? 1 : 0;
  return (Math.PI*2-node.mltm.angle)+((node.pNode.cNodes.indexOf(node)+1)*node.mltm.angle/(node.pNode.cNodes.length+extra));
}

function updateSelectedNode(index, mltm) {
  updateNodes(mltm.mainNode, null, 0);
}

function updateNodes(node, pastNode, sub) {
  node.angle = 0;
  if (node.pNode) {
    node.angle = calcAngle(node);
    if (node.pNode.pNode) node.angle += node.pNode.angle-(Math.PI*2-node.mltm.angle)/2+Math.PI;
    else node.angle += node.mltm.rotation+(node.mltm.angle-node.mltm.angle/node.pNode.cNodes.length)/2;
  }
  if (sub == 0) {
    node.x = Math.round(node.mltm.tag.width()/2-node.mltm.maxsize/2);
    node.y = Math.round(node.mltm.tag.height()/2-node.mltm.maxsize/2);
  } else {
    node.x = pastNode.x;
    node.y = pastNode.y;
    if (sub < node.mltm.limit) {
      if (node.pNode === pastNode) {
        node.x += Math.cos(node.angle)*node.mltm.distances[sub-1];
        node.y += Math.sin(node.angle)*node.mltm.distances[sub-1];
      } else if (pastNode.pNode === node) {
        node.x += Math.cos(pastNode.angle+Math.PI)*node.mltm.distances[sub-1];
        node.y += Math.sin(pastNode.angle+Math.PI)*node.mltm.distances[sub-1];
      }
    }
  }
  node.valueTag.css("z-index",100+sub*-1);
  node.valueTag.velocity({
    top: node.y+"px",
    left: node.x+"px",
    width: node.mltm.maxsize+"px",
    height: node.mltm.maxsize+"px",
    scaleX: Math.pow(node.mltm.proportion,sub),
    scaleY: Math.pow(node.mltm.proportion,sub)
  }, { queue: false });
  if (sub >= node.mltm.limit) {
    node.valueTag.velocity("fadeOut", { queue: false });
    node.valueTag.velocity({
      scaleX: 0,
      scaleY: 0
    }, { queue: false });
  } else if (!node.valueTag.is(":visible"))
    node.valueTag.velocity("fadeIn", { queue: false });

  if (node.pNode && node.pNode !== pastNode)
    updateNodes(node.pNode, node, sub+1);
  for (var i = 0; i < node.cNodes.length; i++)
    if (node.cNodes[i] !== pastNode)
      updateNodes(node.cNodes[i], node, sub+1);
}

function rgb2hex(rgb){
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 return "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2);
}

$(document).ready(function() {
  function initMLTMs() {
      var tag = $(this);
      var mltm = new MLTM(tag);
      mltms.push(mltm);
      tag.data("mltm", mltm);
      initNodes(tag.children("[node]")[0], mltm, null);
  }

  function initNodes(object, mltm, parent) {
    var tag = $(object);
    var node = new Node(tag, $(tag.children("[nodevalue]")[0]), mltm, (parent) ? parent.sub+1 : 0, parent);
    if (parent) parent.cNodes.push(node);
    else mltm.mainNode = node;
    node.valueTag.click({node: node}, reselctNodes);
    tag.data("node", node);
    var nodes = tag.children("[node]");
    for (var i = 0; i < nodes.length; i++)
      initNodes(nodes[i], mltm, node);
  }

  function reselctNodes(event) {
    if (event.data.node.cNodes.length)
      event.data.node.mltm.mainNode = event.data.node;
    else if (event.data.node.pNode) {
      event.data.node.mltm.mainNode = event.data.node.pNode;
      if (rgb2hex(event.data.node.valueTag.css("background-color")) == "#ccffcc")
        event.data.node.valueTag.css("background-color","#ccccff");
      else
        event.data.node.valueTag.css("background-color","#ccffcc");
    }
    $.each(mltms, updateSelectedNode);
  }

  $.each($.find("[mltm]"),initMLTMs);
  $.each(mltms, updateSelectedNode);
});
