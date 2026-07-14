export type AiProviderConfig = {
  name: "mock" | "openai";
  model: string;
  apiKeyEnvVar: string;
};
