import {
  UpdateSection4Input,
  updateSection4Schema,
} from '@/validators/landingPage/updateLandingPage';

export function handleSection4(
  formData: FormData,
  mediaFiles: Record<string, string | File>,
  existingData: any
) {
  const body: any = {};

  body.header = formData.get('header')?.toString();

  body.button = {
    label: formData.get('button[label]')?.toString(),
    link: formData.get('button[link]')?.toString(),
    show: formData.get('button[show]') === 'true',
  };

  body.cards = [];
  let idx = 0;
  while (formData.has(`cards[${idx}][title1]`)) {
    body.cards.push({
      title1: formData.get(`cards[${idx}][title1]`)?.toString() || '',
      title2: formData.get(`cards[${idx}][title2]`)?.toString() || '',
      title3: formData.get(`cards[${idx}][title3]`)?.toString() || '',
      readMore: {
        label: formData.get(`cards[${idx}][readMore][label]`)?.toString() || '',
        link: formData.get(`cards[${idx}][readMore][link]`)?.toString() || '',
      },
      imagePath: formData.get(`cards[${idx}][imagePath]`)?.toString() || '',
    });
    idx++;
  }

  const parsedData: UpdateSection4Input = updateSection4Schema.parse(body);

  const updatedHeader = parsedData.header ?? existingData.header;

  const updatedButton = parsedData.button
    ? { ...existingData.button, ...parsedData.button }
    : existingData.button;

  const updatedCards =
    parsedData.cards?.map((card, idx) => {
      const oldCard = existingData.cards[idx] ?? {};
      const updatedCard: any = { ...oldCard, ...card };

      if (mediaFiles[`card${idx}`]) {
        updatedCard.imagePath = mediaFiles[`card${idx}`];
      } else if (card.imagePath) {
        updatedCard.imagePath = card.imagePath;
      } else {
        updatedCard.imagePath = oldCard.imagePath;
      }

      return updatedCard;
    }) ?? existingData.cards;

  return {
    content: {
      header: updatedHeader,
      button: updatedButton,
      cards: updatedCards,
    },
  };
}
