import {
  UpdateSection5Input,
  updateSection5Schema,
} from '@/validators/landingPage/updateLandingPage';

export function handleSection5(
  body: any,
  mediaFiles: Record<string, string>,
  existingData: UpdateSection5Input
) {
  if (body.mainContent?.button?.show !== undefined) {
    body.mainContent.button.show =
      body.mainContent.button.show === 'true' || body.mainContent.button.show === true;
  }

  const parsedData = updateSection5Schema.parse(body);

  const updatedHeader = parsedData.header ?? existingData.header;

  const updatedMainImage =
    mediaFiles['mainImage'] ?? parsedData.mainImage ?? existingData.mainImage ?? '';

  const updatedMainContent = {
    heading: parsedData.mainContent?.heading ?? existingData.mainContent?.heading ?? '',
    paragraph: parsedData.mainContent?.paragraph ?? existingData.mainContent?.paragraph ?? '',
    button: {
      label: parsedData.mainContent?.button?.label ?? existingData.mainContent?.button?.label ?? '',
      link: parsedData.mainContent?.button?.link ?? existingData.mainContent?.button?.link ?? '',
      show: parsedData.mainContent?.button?.show ?? existingData.mainContent?.button?.show ?? false,
    },
  };

  const existingBrands = existingData.brands ?? { heading: '', paragraph: '', images: [] };
  const existingImages = existingBrands.images ?? [];

  const updatedBrandsHeading = parsedData.brands?.heading ?? existingBrands.heading ?? '';
  const updatedBrandsParagraph = parsedData.brands?.paragraph ?? existingBrands.paragraph ?? '';

  const updatedBrandsImages = (parsedData.brands?.images?.map(
    (_, idx) => mediaFiles[`brand${idx}`] ?? existingImages[idx] ?? ''
  ) ??
    existingImages) || ['', '', ''];

  return {
    content: {
      header: updatedHeader,
      mainImage: updatedMainImage,
      mainContent: updatedMainContent,
      brands: {
        heading: updatedBrandsHeading,
        paragraph: updatedBrandsParagraph,
        images: updatedBrandsImages,
      },
    },
  };
}
