export const findClosestWithoutJecoute = (strings:string[] | undefined) => {
  if (strings === undefined || strings === null || strings.length === 0) {
    return null;
  }

  const regex = /j'écoute/i; // Case-insensitive regular expression
  for (let i = 0; i < strings.length; i++) {
    if (!regex.test(strings[i])) {
      return strings[i];
    }
  }

  // If no string found without "j'écoute", modify the first string that contains more than "j'écoute"
  for (let i = 0; i < strings.length; i++) {
    if (regex.test(strings[i]) && strings[i].trim() !== "j'écoute") {
      return strings[i].replace(regex, '').trim();
    }
  }

  return null; // Return null if all strings are exactly "j'écoute"
};
