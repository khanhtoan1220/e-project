const checkAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "Bạn chưa đăng nhập",
    });
  }
  req.user = req.session.user;
  next();
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.vaiTro)) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện hành động này",
      });
    }
    next();
  };
};

module.exports = { checkAuth, checkRole };
