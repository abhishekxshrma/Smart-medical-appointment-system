export function calcETA(tokenNum) {
  const mins = 9 * 60 + (tokenNum - 1) * 20;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h > 12 ? h - 12 : h}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}