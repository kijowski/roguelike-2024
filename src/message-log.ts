export class Message {
  count = 1;

  constructor(
    public text: string,
    public fg: string,
  ) {}

  get fullText() {
    if (this.count > 1) {
      return `${this.text} (x${this.count})`;
    }
    return this.text;
  }
}

export class MessageLog {
  #messages: Message[] = [];

  addMessage(text: string, fg = "#fff", stack = true) {
    if (
      stack &&
      this.#messages.length > 0 &&
      this.#messages[this.#messages.length - 1].text === text
    ) {
      this.#messages[this.#messages.length - 1].count += 1;
    } else {
      this.#messages.push(new Message(text, fg));
    }
  }

  takeLatest(maxLines = 10, lineWidth = 30) {
    const reversed = this.#messages.slice().reverse();
    let linesCount = 0;
    const result = [];
    for (let i = 0; i < reversed.length; i++) {
      const message = reversed[i];
      if (message.fullText.length < lineWidth) {
        result.push(message.fullText);
        linesCount += 1;
      } else {
        const words = message.fullText.split(" ");
        let lines = [];
        let line: string[] = [];
        let size = 0;
        for (let i = 0; i < words.length; i++) {
          if (size + words[i].length < lineWidth) {
            line.push(words[i]);
            size += words[i].length;
          } else {
            lines.push(line.join(" "));
            line = [words[i]];
          }
        }
        if (line.length > 0) {
          lines.push(line.join(" "));
        }
        if (linesCount + lines.length > maxLines) {
          break;
        }
        linesCount += lines.length;
        result.push(lines.join("\n"));
      }
    }
    return result;
  }
}
