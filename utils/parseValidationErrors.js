/*
    If there is a Mongoose validation error when creating a user record, 
    we need to parse the validation error object to return the issues to 
    the user in a more helpful format
*/
const parseValidationErrors = (err, req) => {
  const keys = Object.keys(err.errors);
  keys.forEach((key) => {
    req.flash("error", ket + ":" + err.errors[key].properties.message);
  });
};

module.exports = parseValidationErrors;
