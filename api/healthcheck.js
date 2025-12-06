// api/healthcheck.js
module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({
    ok: true,
    route: "/api/healthcheck",
    time: new Date().toISOString()
  }));
};
