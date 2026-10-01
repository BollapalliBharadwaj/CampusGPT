const vectorStore = [];

function addToVectorStore(
  chunk,
  embedding
) {

  vectorStore.push({
    chunk,
    embedding
  });

}

function getAllVectors() {

  return vectorStore;

}

module.exports = {
  addToVectorStore,
  getAllVectors
};