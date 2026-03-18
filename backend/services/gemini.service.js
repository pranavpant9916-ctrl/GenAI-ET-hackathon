const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
    apiKey: process.env.API_KEY1,
});

module.exports = async (code) => {
    try {
        const response = await client.messages.create({
            model: "claude-3-haiku-20240307",
            max_tokens: 500,
            messages: [
                {
                    role: "user",
                    content: `You are a senior software engineer reviewing production-grade systems.

Analyze the following code for:
- Bugs
- Security issues
- Performance problems
- Best practices
- Scalability risks
- Technical debt (6–12 months)

Give short, clear bullet points.

Code:
${code}`
                }
            ]
        });

        return response.content[0].text;

    } catch (err) {
        console.error(err);
        return "Claude analysis failed";
    }
};