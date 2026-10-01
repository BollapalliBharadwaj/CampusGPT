function cosineSimilarity(a, b) {

    let dot = 0;
    let magA = 0;
    let magB = 0;

    for (let i = 0; i < a.length; i++) {

        dot += a[i] * b[i];
        magA += a[i] * a[i];
        magB += b[i] * b[i];

    }

    return dot /
        (Math.sqrt(magA) * Math.sqrt(magB));
}

function searchChunks(
    questionEmbedding,
    vectors
) {

    const results = vectors.map(item => ({

        chunk: item.chunk,

        score: cosineSimilarity(
            questionEmbedding,
            item.embedding
        )

    }));

    results.sort(
        (a, b) => b.score - a.score
    );

    return results.slice(0, 3);

}

searchChunks.cosineSimilarity = cosineSimilarity;
module.exports = searchChunks;