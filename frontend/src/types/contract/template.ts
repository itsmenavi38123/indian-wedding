export interface TemplatePage {
  id: string;
  content: string;
}

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  pages: TemplatePage[];
}
