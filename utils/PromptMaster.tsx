export class PromptMaster {
  prompt: string;
  tokenCount: number;
  apiKey: string;
  engine: string;
  tokenLimits: Map<string, number> = new Map();

  constructor({
    input,
    apiKey,
    engine,
  }: {
    input: string;
    apiKey: string;
    engine: string;
  }) {
    this.prompt = this.sanitise(input);
    this.tokenCount = this.tokenise(this.prompt);
    this.apiKey = apiKey;
    this.engine = engine;

    // GPT-3
    // this.registerTokenLimit("davinci", 2048);
    // this.registerTokenLimit("curie", 2048);
    // this.registerTokenLimit("babbage", 2048);
    // this.registerTokenLimit("ada", 2048);
    // this.registerTokenLimit("curie-instruct-beta", 2048);
    // this.registerTokenLimit("davinci-instruct-beta", 2048);

    // GPT-3.5
    this.registerTokenLimit("gpt-3.5-turbo", 4098);
    // this.registerTokenLimit("gpt-3.5-turbo-0301", 4098);
    // this.registerTokenLimit("text-davinci-003", 4098);
    // this.registerTokenLimit("text-davinci-002", 4098);
    // this.registerTokenLimit("code-davinci-002", 8000);

    // GPT-4
    // this.registerTokenLimit("gpt-4", 2048);
    // this.registerTokenLimit("gpt-4-0314", 2048);
    // this.registerTokenLimit("gpt-4-32k", 2048);
    // this.registerTokenLimit("gpt-4-32k-0314", 2048);
  }

  registerTokenLimit = (engine: string, limit: number) => {
    this.tokenLimits.set(engine, limit);
  };

  askAi = async (prompt: string, ctx: string) => {
    const endpoint = `https://api.openai.com/v1/chat/completions`;

    const requestOptions = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: ctx,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0.8,
        model: this.engine,
      }),
    };

    const response = await fetch(endpoint, requestOptions);

    const data = await response.json();
    console.log("data:", data);

    if (response.status !== 200) {
      alert(data.error.message);
      throw new Error(data.error.message);
    }
    const text = data.choices[0].message.content;

    console.log("text:", text);

    return text;
  };

  context = async (ctx: string = ""): Promise<string> => {
    const answers = [];

    let fullPrompt = `${ctx}${this.prompt}`;

    console.log("fullPrompt:", fullPrompt);

    const tokenCount = this.tokenise(fullPrompt);
    const tokenLimit = this.tokenLimits.get(this.engine);

    // calculate how many chunks we need to split the prompt into
    const chunkCount = Math.ceil(tokenCount / tokenLimit!);

    console.log("tokenCount:", tokenCount);
    console.log("tokenLimit:", tokenLimit);
    console.log("chunkCount:", chunkCount);

    if (chunkCount > 2) {
      alert("You must upgrade to a paid plan to use this feature");
      throw new Error("You must upgrade to a paid plan to use this feature");
    }

    // split the prompt into chunks
    const chunks = this.chunks(this.prompt, chunkCount);

    // async foreach loop
    for (const chunk of chunks) {
      console.log("chunk:", chunk);

      const answer = await this.askAi(chunk, ctx);
      answers.push(answer);
    }

    console.log("answers:", answers);

    // join the answers together
    const joinedAnswers = answers.join(" ");

    return joinedAnswers;
  };

  chunks(prompt: string, chunkSize: number) {
    const words = prompt.split(" ");
    const wordsPerChunk = Math.ceil(words.length / chunkSize);
    const chunks = [];

    for (let i = 0; i < chunkSize && words.length > 0; i++) {
      const chunkWords = words.splice(0, wordsPerChunk);
      chunks.push(chunkWords.join(" "));
    }

    return chunks;
  }

  getPrompt = () => {
    return this.prompt;
  };

  getTokenCount = () => {
    return this.tokenCount;
  };

  getEngine = () => {
    return this.engine;
  };

  getSupportedModels = async () => {
    const models = this.tokenLimits.keys();
    return Array.from(models);
  };

  getModels = async () => {
    const url = "https://api.openai.com/v1/models";

    let res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    return await res.json();
  };

  getModel = async () => {
    const url = `https://api.openai.com/v1/models/${this.engine}`;

    let res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });

    return await res.json();
  };

  getModelLimit = async () => {
    try {
      const limit = this.tokenLimits.get(this.engine);
      if (limit) {
        return limit;
      }
      return 2048;
    } catch (e) {
      return 2048;
    }
  };

  sanitise = (input: string) => {
    // Remove HTML tags
    const strippedHtml = input.replace(/<[^>]+>/g, " ");

    // Remove special characters
    const strippedSpecialChars = strippedHtml.replace(/[^\w\s]/gi, "");

    // Replace multiple spaces with a single space
    const normalizedSpaces = strippedSpecialChars.replace(/\s+/g, " ");

    // Trim spaces at the beginning and the end of the string
    const result = normalizedSpaces.trim();

    return result;
  };
  tokenise = (input: string) => {
    const tokens = this.prompt.split(" ");

    return tokens.length;
  };
}
