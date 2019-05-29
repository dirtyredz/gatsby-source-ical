require("util.promisify/shim")();
const util = require("util");
const ical = require("node-ical");
const crypto = require("crypto");
const moment = require("moment-timezone");

const fromURL = util.promisify(ical.fromURL);

const createContentDigest = obj =>
  crypto
    .createHash(`md5`)
    .update(JSON.stringify(obj))
    .digest(`hex`);

function processDatum(
  datum,
  createNodeId,
  sourceInstanceName = "__PROGRAMMATIC__",
  other = {}
) {
  return {
    id: createNodeId(datum.uid),
    parent: null,
    type: datum.type,
    uid: datum.uid,
    dtstamp: moment.tz(datum.dtstamp, "America/Chicago").toDate(), //new Date(datum.dtstamp),
    start: moment.tz(datum.start, "America/Chicago").toDate(), //new Date(datum.start),
    end: moment.tz(datum.end, "America/Chicago").toDate(), //new Date(datum.end),
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

exports.sourceNodes = async ({ actions, createNodeId }, { url, name, other }) => {
  const { createNode } = actions;

  const data = await fromURL(url, {});

  for (let id in data) {
    if (!data.hasOwnProperty(id)) {
      return;
    }

    const datum = data[id];

    if (datum.type === "VEVENT") {
      createNode(processDatum(datum, createNodeId, name, other));
    }
  }
};
