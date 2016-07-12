/**
 * A general set of utility function for 34Cross.in
 */

/**
 * isDefined check if the object has a valid.
 * @param  {Any}  value is the Object.
 * @return {Boolean} if the value is present on the given Object.
 */
function isDefined(value) {
   if (value === undefined || value === null) {
      return false;
   } else if (typeof value === 'string' && value.trim() === '') {
      return false;
   } else {
      return true;
   }
}

module.exports = {
   isDefined: isDefined
};
