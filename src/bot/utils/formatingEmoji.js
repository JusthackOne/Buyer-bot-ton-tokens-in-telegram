export default function (emoji, value) {
  return emoji.repeat(Math.floor(value / 10))
}
