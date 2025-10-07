import prisma from '@/config/prisma';
import {
  UpdateSection3Input,
  updateSection3Schema,
} from '@/validators/landingPage/updateLandingPage';

function isNonEmptyString(value?: string) {
  return typeof value === 'string' && value.trim() !== '';
}

export async function handleSection3(
  body: any,
  mediaFiles: Record<string, string>,
  existingContent?: any
) {
  const parsedData: UpdateSection3Input = updateSection3Schema.parse(body);

  const header = isNonEmptyString(parsedData.header)
    ? parsedData.header
    : isNonEmptyString(existingContent?.header)
      ? existingContent.header
      : '';

  const mergedContents =
    parsedData.contents?.map((newContent, idx) => {
      const oldContent = existingContent?.contents?.[idx] || {};
      return {
        heading: isNonEmptyString(newContent.heading)
          ? newContent.heading
          : oldContent.heading || '',
        paragraph: isNonEmptyString(newContent.paragraph)
          ? newContent.paragraph
          : oldContent.paragraph || '',
      };
    }) ||
    existingContent?.contents ||
    [];

  const bgImage = mediaFiles['bgImage'] || existingContent?.bgImage || '';

  return {
    content: {
      header,
      bgImage,
      contents: mergedContents,
    },
  };
}
