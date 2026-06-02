/**
 * Pure helper — derives password strength score.
 * Returns: 0 (empty) | 1 (too short) | 2 (weak) | 3 (medium) | 4 (strong)
 */
export function getPwStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0;
  if (password.length < 6) return 1;

  let score = 1;
  if (password.length >= 6) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  return score as 0 | 1 | 2 | 3 | 4;
}
