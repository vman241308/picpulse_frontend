export function validateEmails(email) {
  // Regex pattern for email
  var pattern = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;

  return pattern.test(email); // It will return true if email is valid, otherwise false
}
