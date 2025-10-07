import { z } from 'zod';

const optionalString = z.preprocess((val) => {
  if (typeof val === 'string' && val.trim() === '') {
    return undefined;
  }
  return val;
}, z.string().optional());

// section 1 schema
export const updateSection1Schema = z.object({
  header: optionalString,
  text1: optionalString,
  buttons: z
    .array(
      z.object({
        label: z.string().min(1),
        show: z.boolean(),
      })
    )
    .optional(),
});
export type UpdateSection1Input = z.infer<typeof updateSection1Schema>;

// Section 2 schema

export const updateSection2Schema = z.object({
  header: optionalString,
  cards: z
    .record(
      z.object({
        title: optionalString,
        link: optionalString,
        imagePath: optionalString,
      })
    )
    .optional(),
});

export type UpdateSection2Input = z.infer<typeof updateSection2Schema>;

// Section 3 schema

export const updateSection3Schema = z.object({
  header: optionalString,
  bgImage: optionalString,
  contents: z
    .array(
      z.object({
        heading: optionalString,
        paragraph: optionalString,
      })
    )
    .optional(),
});
export type UpdateSection3Input = z.infer<typeof updateSection3Schema>;

// Section 4 schema
export const updateSection4Schema = z.object({
  header: z.string().min(1).optional(),
  button: z
    .object({
      label: z.string().min(1).optional(),
      link: z.string().optional(),
      show: z.boolean().optional(),
    })
    .optional(),
  cards: z
    .array(
      z.object({
        title1: z.string().optional(),
        title2: z.string().optional(),
        title3: z.string().optional(),
        readMore: z
          .object({
            label: z.string().min(1).optional(),
            link: z.string().optional(),
          })
          .optional(),
        imagePath: z.string().optional(),
      })
    )
    .optional(),
});

export type UpdateSection4Input = z.infer<typeof updateSection4Schema>;

// Section 5 schema
export const updateSection5Schema = z.object({
  header: z.string().min(1).optional(),
  mainImage: z.string().optional(),
  mainContent: z
    .object({
      heading: z.string().min(1).optional(),
      paragraph: z.string().min(1).optional(),
      button: z
        .object({
          label: z.string().min(1).optional(),
          link: z.string().optional(),
          show: z.boolean().optional(),
        })
        .optional(),
    })
    .optional(),
  brands: z
    .object({
      heading: z.string().min(1).optional(),
      paragraph: z.string().optional(),
      images: z.array(z.string().min(1)).length(3).optional(),
    })
    .optional(),
});

export type UpdateSection5Input = z.infer<typeof updateSection5Schema>;

export const updateSection6Schema = z.object({
  heading: optionalString,
});

export type UpdateSection6Input = z.infer<typeof updateSection6Schema>;
