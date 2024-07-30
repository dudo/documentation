import { z } from 'zod';
import { SNAKE_CASE_REGEX, PREF_OPTIONS_ID_REGEX } from '../regexes';

/**
 * An option for a preference,
 * as defined in the preference options configuration files.
 *
 * @example
 * display_name: Postgres
 * identifier: postgres
 * default: true
 */
const PrefOptionSchema = z
  .object({
    display_name: z.string(),
    default: z.boolean().optional(),
    identifier: z.string().regex(SNAKE_CASE_REGEX)
  })
  .strict();

const MinifiedPrefOptionSchema = z
  .object({
    dn: z.string(), // display name
    d: z.boolean().optional(), // default
    i: z.string().regex(SNAKE_CASE_REGEX) // identifier
  })
  .strict();

export const MinifiedPrefOptionsConfigSchema = z.record(
  z.string().regex(PREF_OPTIONS_ID_REGEX),
  z.array(MinifiedPrefOptionSchema)
);

/**
 * A minified version of the PrefOptionsConfigSchema.
 */
export type MinifiedPrefOptionsConfig = z.infer<typeof MinifiedPrefOptionsConfigSchema>;

/**
 * The validated preference options configuration
 * ingested from YAML files.
 */
export const PrefOptionsConfigSchema = z.record(
  z.string().regex(PREF_OPTIONS_ID_REGEX),
  z
    .array(PrefOptionSchema)
    // verify that one and only one option is marked as default
    .refine((options) => {
      const defaultOptions = options.filter((option) => option.default);
      if (defaultOptions.length > 1) {
        console.error('Only one option can be marked as default');
        return false;
      } else if (defaultOptions.length === 0) {
        console.error('One option must be marked as default');
        return false;
      }
      return true;
    })
);

/**
 * The validated preference options configuration
 * ingested from YAML files.
 *
 * @example
 * {
 *  primary_color_options: [
 *   { identifier: 'red', display_name: 'Red', default: true },
 *   { identifier: 'blue', display_name: 'Blue' },
 *   { identifier: 'yellow', display_name: 'Yellow' }
 *  ],
 *  traffic_light_color_options: [
 *   { identifier: 'red', display_name: 'Red', default: true },
 *   { identifier: 'green', display_name: 'Green' },
 *   { identifier: 'yellow', display_name: 'Yellow' }
 *  ],
 * }
 */
export type PrefOptionsConfig = z.infer<typeof PrefOptionsConfigSchema>;
