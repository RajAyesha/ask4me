import { ask } from "./index.js";

const endpoint = "http://localhost:8080/v1/ask";
const apiKey = "change-me";

async function main() {
  const payload = {
    title: "Ask4Me Demo",
    body: "这是一条来自 Ask4Me 的测试消息，请随便点一个按钮或回一段话。",
    mcd:
      "## Ask4Me Demo\n\n" +
      "请确认你收到了这条消息，并给一点简单反馈：\n\n" +
      ":::buttons\n" +
      "- [OK](ok)\n" +
      "- [Later](later)\n" +
      ":::\n\n" +
      ":::input name=\"note\" label=\"补充说明\" submit=\"提交\"\n" +
      ":::",
    expires_in_seconds: 600
  };

  const { events, result } = await ask({
    endpoint,
    apiKey,
    payload
  });

  const finalEvent = result ?? events.at(-1) ?? null;
  console.log(JSON.stringify(finalEvent, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
