const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getMe = (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  console.log("req.user START:", req.user);

  const id = req.user._id;
  const user = await User.findById(id).select("name avatar email");
  if (!user) return next(new AppError("User not found", 404));

  user.avatar = req.body.avatar;
  await user.save();
  console.log(user);

  res.status(200).json({
    status: "success",
    user,
  });
});
