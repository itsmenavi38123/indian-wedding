import {
  UpdateSection1Input,
  updateSection1Schema,
} from '@/validators/landingPage/updateLandingPage';

export function handleSection1(body: any, mediaFiles: Record<string, string>) {
  if (body.buttons && Array.isArray(body.buttons)) {
    body.buttons = body.buttons.map((btn: any) => ({
      ...btn,
      show: btn.show === 'true' || btn.show === true,
    }));
  }

  const parsedData: UpdateSection1Input = updateSection1Schema.parse(body);

  const content: Record<string, any> = {};

  if (parsedData.header !== undefined) content.header = parsedData.header;
  if (parsedData.text1 !== undefined) content.text1 = parsedData.text1;

  if (parsedData.buttons) {
    content.buttons = parsedData.buttons.map((btn) => ({
      label: btn.label,
      show: typeof btn.show === 'string' ? btn.show === 'true' : btn.show,
    }));
  }

  Object.assign(content, mediaFiles);

  return { content };
}
