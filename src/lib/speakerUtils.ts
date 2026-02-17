/**
 * Normalize speaker names to consolidate variations
 * Removes titles, standardizes formatting
 */
export function normalizeSpeakerName(name: string): string {
  if (!name) return name;

  let normalized = name;

  // Remove titles
  normalized = normalized.replace(/^(Dr\.?|Mr\.?|Ms\.?|Mrs\.?|Prof\.?|Professor|Shri)\s+/i, '');

  // Remove leading/trailing whitespace
  normalized = normalized.trim();

  return normalized;
}

/**
 * Get base name for grouping (without organization)
 * Used for deduplication
 */
export function getBaseSpeakerName(name: string): string {
  const normalized = normalizeSpeakerName(name);

  // Take only the name part (before comma)
  const baseName = normalized.split(',')[0].trim();

  return baseName;
}

/**
 * Get the canonical/preferred speaker name from variations
 * Prefers names with organizations over bare names
 */
export function getCanonicalSpeakerName(variations: string[]): string {
  if (variations.length === 0) return '';
  if (variations.length === 1) return normalizeSpeakerName(variations[0]);

  // Prefer names with organization info (contains comma)
  const withOrg = variations.filter(v => v.includes(','));
  if (withOrg.length > 0) {
    // Prefer longer, more detailed versions
    return normalizeSpeakerName(withOrg.sort((a, b) => b.length - a.length)[0]);
  }

  // Otherwise return the first variation
  return normalizeSpeakerName(variations[0]);
}

/**
 * Create a mapping of all speaker variations to their canonical names
 */
export function createSpeakerNameMapping(allSpeakers: string[]): Map<string, string> {
  const speakerGroups = new Map<string, string[]>();

  // Group speakers by base name
  allSpeakers.forEach(speaker => {
    const baseName = getBaseSpeakerName(speaker).toLowerCase();
    if (!speakerGroups.has(baseName)) {
      speakerGroups.set(baseName, []);
    }
    speakerGroups.get(baseName)!.push(speaker);
  });

  // Create mapping from each variation to canonical name
  const mapping = new Map<string, string>();
  speakerGroups.forEach((variations) => {
    const canonical = getCanonicalSpeakerName(variations);
    variations.forEach(variation => {
      mapping.set(variation, canonical);
    });
  });

  return mapping;
}

/**
 * Normalize an array of speakers using the provided mapping
 */
export function normalizeSpeakers(speakers: string[], mapping: Map<string, string>): string[] {
  return speakers
    .map(speaker => mapping.get(speaker) || normalizeSpeakerName(speaker))
    .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
}
