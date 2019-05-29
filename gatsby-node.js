"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

require("util.promisify/shim")();

const util = require("util");

const ical = require("node-ical");

const crypto = require("crypto");

const moment = require("moment-timezone");

const fromURL = util.promisify(ical.fromURL);

const createContentDigest = obj => crypto.createHash(`md5`).update(JSON.stringify(obj)).digest(`hex`);

function processDatum(datum, createNodeId, sourceInstanceName = "__PROGRAMMATIC__", other = {}) {
  return {
    id: createNodeId(datum.uid),
    parent: null,
    type: datum.type,
    uid: datum.uid,
    dtstamp: moment.tz(datum.dtstamp, "America/Chicago").toDate(),
    //new Date(datum.dtstamp),
    start: moment.tz(datum.start, "America/Chicago").toDate(),
    //new Date(datum.start),
    end: moment.tz(datum.end, "America/Chicago").toDate(),
    //new Date(datum.end),
    summary: datum.summary,
    location: datum.location,
    description: datum.description,
    rrule: datum.rrule !== undefined ? datum.rrule.toString() : undefined,
    children: [],
    sourceInstanceName,
    internal: {
      type: "Ical",
      contentDigest: createContentDigest(datum)
    },
    other: other
  };
}

exports.sourceNodes =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(function* ({
    actions,
    createNodeId
  }, {
    url,
    name,
    other
  }) {
    const createNode = actions.createNode;
    const data = yield fromURL(url, {});

    for (let id in data) {
      if (!data.hasOwnProperty(id)) {
        return;
      }

      const datum = data[id];

      if (datum.type === "VEVENT") {
        createNode(processDatum(datum, createNodeId, name, other));
      }
    }
  });

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();