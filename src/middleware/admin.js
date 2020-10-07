const admin = async(req, res, next) => {
  try {
    if (req.user.isAdmin) {
      next();
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(401).send({ error: 'Only admin resource' });
  }
}

export default admin;