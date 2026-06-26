function chunkText(text, chunkSize = 500, overlapSize = 100) {
  if (!text) return [];
  
  // Clean up excessive whitespace/newlines for cleaner chunking
  const cleanText = text.replace(/\s+/g, " ").trim();
  
  // Split into sentences using a lookbehind to preserve punctuation
  const sentences = cleanText.split(/(?<=[.!?])\s+/);
  
  const chunks = [];
  let currentChunk = [];
  let currentLength = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    // If a single sentence exceeds the chunk size, split it naively by words
    if (sentence.length > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(" "));
        currentChunk = [];
        currentLength = 0;
      }
      
      const words = sentence.split(" ");
      let wordChunk = [];
      let wordLength = 0;
      for (const word of words) {
        if (wordLength + word.length + 1 > chunkSize) {
          chunks.push(wordChunk.join(" "));
          
          // Overlap: keep last few words
          const overlapWords = [];
          let overlapLen = 0;
          for (let j = wordChunk.length - 1; j >= 0; j--) {
            if (overlapLen + wordChunk[j].length + 1 <= overlapSize) {
              overlapWords.unshift(wordChunk[j]);
              overlapLen += wordChunk[j].length + 1;
            } else {
              break;
            }
          }
          wordChunk = [...overlapWords, word];
          wordLength = overlapLen + word.length + 1;
        } else {
          wordChunk.push(word);
          wordLength += word.length + 1;
        }
      }
      if (wordChunk.length > 0) {
        currentChunk = wordChunk;
        currentLength = wordLength;
      }
      continue;
    }

    if (currentLength + sentence.length + 1 > chunkSize) {
      chunks.push(currentChunk.join(" "));
      
      const overlapSentences = [];
      let overlapLen = 0;
      for (let j = currentChunk.length - 1; j >= 0; j--) {
        if (overlapLen + currentChunk[j].length + 1 <= overlapSize) {
          overlapSentences.unshift(currentChunk[j]);
          overlapLen += currentChunk[j].length + 1;
        } else {
          break;
        }
      }
      
      currentChunk = [...overlapSentences, sentence];
      currentLength = overlapLen + sentence.length + 1;
    } else {
      currentChunk.push(sentence);
      currentLength += sentence.length + 1;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join(" "));
  }

  return chunks.map(c => c.trim()).filter(Boolean);
}

module.exports = chunkText;