export type Agent = {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  outputSchema: string;
  createdAt: number;
  builtIn: boolean;
};

export type AgentCreateInput = {
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  outputSchema?: string;
};

export type AgentUpdateInput = Partial<AgentCreateInput>;

export type RunMode = "sequential" | "parallel";

export type RunRequest = {
  idea: string;
  agentIds: string[];
  mode: RunMode;
};

export type AgentRunResult = {
  agentId: string;
  name: string;
  outputText?: string;
  error?: string;
  ok: boolean;
};

export type RunResponse = {
  idea: string;
  mode: RunMode;
  results: AgentRunResult[];
};

export type BuilderRequest = {
  goal: string;
};

export type SuggestedAgent = {
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
};

export type GenerationMode = "full" | "brand" | "positioning" | "landing" | "marketing";

export type NexoraResult = {
  brandNames: string[];
  tagline: string;
  description: string;
  targetAudience: string;
  positioning: string;
  valueProposition: string;
  landingPageCopy: {
    heroHeadline: string;
    heroSubheadline: string;
    primaryCta: string;
    featureBullets: string[];
  };
  marketingMessaging: {
    hooks: string[];
    emailSubjectLines: string[];
    adAngles: string[];
  };
};
