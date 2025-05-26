import basicAuth from "basic-auth";

const USER = process.env.BASIC_AUTH_USER || "admin";
const PASS = process.env.BASIC_AUTH_PASS || "password";

function auth(req, res, next) {
  const user = basicAuth(req);
  if (!user || user.name !== USER || user.pass !== PASS) {
    res.set("WWW-Authenticate", 'Basic realm="401"');
    return res.status(401).send("Authentication required.");
  }
  next();
}

export default auth;
