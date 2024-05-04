export default function (text) {
  if (text.length > 100) {
    return `${text.slice(0, 97)}...`;
  }
  return text;
}
