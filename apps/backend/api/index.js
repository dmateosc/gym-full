let handler;
try {
  handler = require("../dist/main.vercel.js").default;
} catch (err) {
  handler = (req, res) => {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ loadError: err.message, stack: err.stack }));
  };
}
module.exports = handler;
module.exports.default = handler;
