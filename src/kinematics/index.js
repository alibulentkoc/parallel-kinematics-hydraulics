/**
 * @file index.js
 * Public surface of the kinematics module.
 */
export {
  KinematicsBase,
  makeKinematics,
  defaultGeometry2DOF,
  defaultGeometry3DOF,
} from "./kinematics.js";
export { Kinematics2DOF } from "./kinematics2dof.js";
export { Kinematics3DOF } from "./kinematics3dof.js";
