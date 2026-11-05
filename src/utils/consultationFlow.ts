/** ISO 3166-1 regions; native select labels come from Intl.DisplayNames in the active language. */
export const consultationCountries = ('AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW').split(' ')
export const reportOptions = ['none', 'has', 'need_help', 'skip'] as const
export const budgetOptions = ['unknown', 'under_5000', '5000_15000', '15000_30000', 'over_30000'] as const
export const timeOptions = ['one_month', 'one_three', 'three_six', 'flexible'] as const
export const handoffReasons = ['general', 'quote', 'report', 'appointment', 'records'] as const
export type HandoffReason = (typeof handoffReasons)[number]

/** Require an explicit international prefix; never guess it from the residence country. */
export function normalizeConsultationPhone(value: string): string | undefined {
  if (!/^(?:\+|00)[\d ()-]+$/.test(value.trim())) return
  const normalized = value.trim().replace(/^00/, '+').replace(/[ ()-]/g, '')
  return /^\+[1-9]\d{6,14}$/.test(normalized) ? normalized : undefined
}
