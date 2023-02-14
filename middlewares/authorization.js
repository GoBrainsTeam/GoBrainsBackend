import jwt from "jsonwebtoken";

export function authenticateUser(req, res, next) {
  const bearerHeader = req.headers['authorization']
  try {

    if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const bearerToken = bearer[1];
      req.token = bearerToken;
      jwt.verify(bearerToken, 'secret', (err, result) => {
        if (err) return res.status(403).send({ message: "Forbidden!" })
        else {
          req.user = {
            "id": result["id"],
            "email": result["email"],
            "isAdmin": result["isAdmin"],
          }
          next()
        }
      })
    } else {
      res.status(403).send({ message: "Forbidden!" });
    }
  } catch (e) {
    return res.status(401).send({ message: "Unauthorized!" })
  }
}