export function generateRandomPassword(length = 8) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const special = '@$!%*?&_-';

  const allChars = lowercase + uppercase + numbers + special;
  let password = '';

  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  const remainingLength = length - password.length + Math.floor(Math.random() * 3);
  for (let i = 0; i < remainingLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  password = password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');

  console.log('Generated password:', password);
  return password;
}
