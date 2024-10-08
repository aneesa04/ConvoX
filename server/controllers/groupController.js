const catchAsync = require("../utils/catchAsync.js");
const Group = require("../models/groupModel.js");
const User = require("../models/userModel.js");

exports.createGroup = catchAsync(async (req, res, next) => {
  const group = await Group.create({
    name: req.body.name,
    description: req.body.description,
    admin: req.user._id,
  });
  const groupMembers = req.body.groupMembers;
  groupMembers.map(async (member) => {
    await User.findByIdAndUpdate(member, { $push: { groupIds: group._id } });
  });
  res.status(201).json({
    status: "success",
    group,
  });
});

exports.updateGroupName = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  await Group.findByIdAndUpdate(
    groupId,
    { name: req.body.name },
    { new: true }
  );
  res.status(200).json({
    status: "success",
  });
});
exports.removeGroupMember = catchAsync(async (req, res, next) => {
  const { groupId, userId } = req.params;
  await User.findByIdAndUpdate(userId, { $pull: { groupIds: groupId } });
  res.status(200).json({
    status: "success",
  });
});

exports.deleteGroup = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  await Group.findByIdAndUpdate(groupId, { active: false });
  res.status(200).json({
    status: "success",
  });
});
exports.getGroupMembers = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const groupMembers = await User.find({ groupIds: { $in: [groupId] } }).select(
    "name _id"
  );
  res.status(200).json({
    status: "success",
    groupMembers,
  });
});
