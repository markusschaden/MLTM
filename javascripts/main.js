function rgb2hex(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" +
    ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2);
}

function reselctNodes(event) {
  if (event.data.node.cNodes.length)
    event.data.node.mltm.mainNode = event.data.node;
  else if (event.data.node.pNode) {
    event.data.node.mltm.mainNode = event.data.node.pNode;
    if (rgb2hex(event.data.node.valueTag.css("background-color")) == "#ccffcc")
      event.data.node.valueTag.css("background-color", "#ccccff");
    else
      event.data.node.valueTag.css("background-color", "#ccffcc");
  }
}

var velocity_easings = new Array("ease", "ease-in", "ease-out", "ease-in-out");

function MLTM(tag) {
  this._mainNode = null;
  this._maxsize = 100;
  this._proportion = 0.8;
  this._limit = 3;
  this._angle = Math.PI * 2;
  this._extraSpace = 50;
  this._rotation = 0;
  this._duration = 400;
  this._easing = "ease-out";
  this._zIndex = 100;
  this.node = null;
  this.distances = new Array();
  this.innersizes = new Array();
  this.proportions = new Array();
  this.controlsize = 0;
  this.tag = $(tag);
}

MLTM.prototype = {
  get tag() {
    return this._tag;
  },
  set tag(value) {
    this._tag = value;
    this.tag.data("mltm", this);
    this._mainNode = this.node = new Node(this.tag, this, null);
    this.recalcValues();
  },
  get mainNode() {
    return this._mainNode;
  },
  set mainNode(value) {
    this._mainNode = value;
    this.redrawNodes();
  },
  get maxsize() {
    return this._maxsize;
  },
  set maxsize(value) {
    if (value > 0) {
      this._maxsize = value;
      this.recalcValues();
    }
  },
  get proportion() {
    return this._proportion;
  },
  set proportion(value) {
    if (value <= 1 && value > 0) {
      this._proportion = value;
      this.recalcValues();
    }
  },
  get limit() {
    return this._limit;
  },
  set limit(value) {
    if (value >= 0) {
      this._limit = value;
      this.recalcValues();
    }
  },
  get angle() {
    return this._angle;
  },
  set angle(value) {
    if (value > 0 && value <= Math.PI * 2) {
      this._angle = value;
      this.recalcValues();
    }
  },
  get extraSpace() {
    return this._extraSpace;
  },
  set extraSpace(value) {
    if (value >= 0) {
      this._extraSpace = value;
      this.recalcValues();
    }
  },
  get rotation() {
    return this._rotation;
  },
  set rotation(value) {
    if (value >= 0 && value <= Math.PI * 2) {
      this._rotation = value;
      this.redrawNodes();
    }
  },
  get duration() {
    return this._duration;
  },
  set duration(value) {
    if (value >= 0) this._duration = value;
  },
  get easing() {
    return this._easing;
  },
  set easing(value) {
    if (velocity_easings.indexOf(value) > -1) this._easing = value;
  },
  get zIndex() {
    return this._zIndex;
  },
  set zIndex(value) {
    this._zIndex = value;
    this.redrawNodes();
  },
};

MLTM.prototype.recalcValues = function() {
  this.innersizes.length = 0;
  this.innersizes.push(this.maxsize + this.extraSpace);
  this.controlsize = 0;
  for (var i = 0; i < this.limit; i++) {
    this.controlsize += this.innersizes[i] * /*((this.angle <= Math.PI) ? 1 : */Math.pow(2, i)/*)*/;
    this.innersizes.push(this.innersizes[i] * this.proportion);
  }

  this.distances.length = 0;
  this.proportions.length = 0;
  this.proportions.push(1);
  for (var i = 0; i < this.limit - 1; i++) {
    /*if (this.angle <= Math.PI) this.distances.push(this.innersizes[i] / 2 + this.innersizes[i + 1] / 2);
    else */this.distances.push((((i > 0) ? 2 * this.distances[i - 1] - this.innersizes[i - 1] : this.controlsize) - this.innersizes[i]) / 4 + this.innersizes[i] / 2)
    this.proportions.push(Math.pow(this.proportion, i + 1));
  }

  this.redrawNodes();
};

MLTM.prototype.redrawNodes = function() {
  if (this.mainNode)
    this.mainNode.redrawNodes(null, 0);
};

function Node(tag, mltm, parent) {
  this.valueTag = null;
  this.connectorTag = null;
  this.mltm = mltm;
  this.pNode = parent;
  this.cNodes = new Array();
  this.x = 0;
  this.y = 0;
  this.angle = 0;
  this.tag = $(tag);
}

Node.prototype = {
  get tag() {
    return this._tag;
  },
  set tag(value) {
    this._tag = value;
    this.tag.data("node", this);
    this.valueTag = $(this.tag.children("[nodevalue]")[0]);
    this.valueTag.click({
      node: this
    }, reselctNodes);
    var conn = this.tag.children("[nodeconnector]")[0];
    if (conn)
      this.connectorTag = $(conn);
    var nodes = this.tag.children("[node]");
    for (var i = 0; i < nodes.length; i++)
      this.cNodes.push(new Node($(nodes[i]), this.mltm, this));
  }
};

Node.prototype.redrawNodes = function(pastNode, sub) {
  this.angle = 0;
  if (this.pNode) {
    this.angle = (Math.PI * 2 - this.mltm.angle) + ((this.pNode.cNodes.indexOf(this) + 1) * this.mltm.angle / (this.pNode.cNodes.length + ((this.pNode.pNode) ? 1 : 0)));
    if (this.pNode.pNode) this.angle += this.pNode.angle - (Math.PI * 2 - this.mltm.angle) / 2 + Math.PI;
    else this.angle += this.mltm.rotation + (this.mltm.angle - this.mltm.angle / this.pNode.cNodes.length) / 2;
  }
  if (sub == 0) {
    this.x = Math.round(this.mltm.tag.width() / 2 - this.mltm.maxsize / 2);
    this.y = Math.round(this.mltm.tag.height() / 2 - this.mltm.maxsize / 2);
  } else {
    this.x = pastNode.x;
    this.y = pastNode.y;
    if (sub < this.mltm.limit) {
      if (this.pNode === pastNode) {
        this.x += Math.cos(this.angle) * this.mltm.distances[sub - 1];
        this.y += Math.sin(this.angle) * this.mltm.distances[sub - 1];
      } else if (pastNode.pNode === this) {
        this.x += Math.cos(pastNode.angle + Math.PI) * this.mltm.distances[sub - 1];
        this.y += Math.sin(pastNode.angle + Math.PI) * this.mltm.distances[sub - 1];
      }
    }
  }

  var velocityProps = {
    queue: false,
    duration: this.mltm.duration,
    easing: this.mltm.easing
  }

  if (pastNode) {
    var tag = (pastNode.pNode === this) ? pastNode : this;
    if (tag.connectorTag) {
      tag.connectorTag.css("z-index", tag.mltm.zIndex + tag.mltm.limit + sub * -1 - 1);
      var connWidth = (sub >= tag.mltm.limit) ? 0 : tag.mltm.distances[sub - 1];
      var angle = tag.angle + Math.PI;
      tag.connectorTag.velocity({
        top: tag.y + tag.mltm.maxsize / 2 + (Math.sin(angle) * connWidth / 2) + "px",
        left: tag.x + tag.mltm.maxsize / 2 + ((Math.cos(angle) * connWidth) - connWidth) / 2 + "px",
        width: connWidth + "px",
        rotateZ: angle * 360 / (2 * Math.PI) + "deg",
        scaleY: tag.mltm.proportions[sub - 1]
      }, velocityProps);
      if (sub >= tag.mltm.limit) {
        tag.connectorTag.velocity("fadeOut", velocityProps);
      } else if (!tag.connectorTag.is(":visible"))
        tag.connectorTag.velocity("fadeIn", velocityProps);
    }
  }

  this.valueTag.css("z-index", this.mltm.zIndex + this.mltm.limit + sub * -1);
  this.valueTag.velocity({
    top: this.y + "px",
    left: this.x + "px",
    width: this.mltm.maxsize + "px",
    height: this.mltm.maxsize + "px",
    scaleX: this.mltm.proportions[sub],
    scaleY: this.mltm.proportions[sub]
  }, velocityProps);
  if (sub >= this.mltm.limit) {
    this.valueTag.velocity("fadeOut", velocityProps);
    this.valueTag.velocity({
      scaleX: 0,
      scaleY: 0
    }, velocityProps);
  } else if (!this.valueTag.is(":visible"))
    this.valueTag.velocity("fadeIn", velocityProps);

  if (this.pNode && this.pNode !== pastNode)
    this.pNode.redrawNodes(this, sub + 1);
  for (var i = 0; i < this.cNodes.length; i++)
    if (this.cNodes[i] !== pastNode)
      this.cNodes[i].redrawNodes(this, sub + 1);
};

$(document).ready(function() {
  function initMLTM() {
    var mltm = new MLTM(this);
  }

  $.each($.find("[mltm]"), initMLTM);
});
