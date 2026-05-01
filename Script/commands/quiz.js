return QUIZ_API;
  } catch {
    return null;
  }
}

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;
  if (!global.client.handleReply) global.client.handleReply = [];

  try {
    const quizAPI = await loadQuizAPI();
    if (!quizAPI) return api.sendMessage("Quiz API error call boss FAHIM✔️", threadID, messageID);

    const res = await axios.get(quizAPI + "/quiz");
    const data = res.data;

    if (!data || !data.question) {
      return api.sendMessage("❌ No quiz available", threadID, messageID);
    }

    const msg =
      `🎮 𝗚𝗮𝗺𝗲 𝗤𝘂𝗶𝘇 𝗦𝘁𝗮𝗿𝘁𝗲𝗱\n` +
      `━━━━━━━━━━━━━━━━━━\n` +
      `🔻 ${data.question}\n\n` +
      `A › ${data.A}\n` +
      `B › ${data.B}\n` +
      `C › ${data.C}\n` +
      `D › ${data.D}\n\n` +
      `⏰ 30s • Reply: A/B/C/D`;

    api.sendMessage(msg, threadID, (err, info) => {
      if (err) return;

      const timeout = setTimeout(async () => {
        const i = global.client.handleReply.findIndex(e => e.messageID === info.messageID);
        if (i === -1) return;

        const hr = global.client.handleReply[i];

        if (!hr.answered) {
          const result = await axios.post(quizAPI + "/quiz/answer", {
            sessionID: hr.sessionID,
            answer: ""
          });

          api.sendMessage(`⏰ Time Up!\nCorrect Answer: ${result.data.answer}`, threadID);
        }

        await api.unsendMessage(info.messageID);
        global.client.handleReply.splice(i, 1);
      }, TIME_LIMIT);

      global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        sessionID: data.sessionID,
        timeout,
        answered: false
      });
    }, messageID);

  } catch {
    api.sendMessage("Quiz API error call boss FAHIM✔", threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handle