/** Keep authored descriptive labels intact; add the suffix only to bare years. */
export function displayDentalExperience(value: string) {
  return /(经验|专家)\s*$/.test(value.trim()) ? value : `${value}经验`
}
